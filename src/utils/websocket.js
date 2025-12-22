/* eslint-disable */ 
class WsClient {
  constructor() {
    this.ws = null;
    // 基础URL移除/auth，保留域名+端口
    this.baseUrl = process.env.VUE_APP_WS_BASE_URL || 'ws://172.20.10.5:8080/ws'; 
    this.url = ''; // 动态生成：baseUrl + /身份_ID
    this.reconnectInterval = 3000; // 重连间隔
    this.isConnected = false; // 连接状态
    this.reconnecting = false; // 重连中标记（修复：初始化该变量）
    this.callbackMap = new Map(); // 消息回调映射
    this.reconnectTimer = null; // 重连定时器
    this.globalMessageHandlers = []; // 全局消息处理器
  }

  /**
   * 注册全局消息处理器（后端主动推送的消息）
   * @param {Function} handler 消息处理函数
   */
  onGlobalMessage(handler) {
    if (typeof handler === 'function' && !this.globalMessageHandlers.includes(handler)) {
      this.globalMessageHandlers.push(handler);
    }
  }

  /**
   * 移除全局消息处理器
   * @param {Function} handler 要移除的处理函数
   */
  offGlobalMessage(handler) {
    this.globalMessageHandlers = this.globalMessageHandlers.filter(h => h !== handler);
  }

  /**
   * 根据身份+ID设置WS URL（核心改动）
   * @param {string} identity 身份：student/teacher/emp
   * @param {number|string} id 数字ID：如2、100、5
   */
  setWsUrlByIdentity(identity, id) {
    // 校验参数合法性
    if (!['student', 'teacher', 'emp'].includes(identity) || !id) {
      console.error('WS URL参数错误：身份必须是student/teacher/emp，ID不能为空');
      return;
    }
    // 拼接格式：/ws/student_2、/ws/teacher_100、/ws/emp_5
    this.url = `${this.baseUrl}/${identity}_${id}`;
    console.log('动态生成WS URL:', this.url);
  }

  /**
   * 建立WebSocket连接（含重连逻辑）
   * @returns {Promise<WebSocket>} 连接成功的WS实例
   */
  connect() {
    return new Promise((resolve, reject) => {
      // 1. 校验重连状态：避免重复重连
      if (this.reconnecting) {
        reject(new Error('正在重连中，请稍后'));
        return;
      }

      // 2. 校验URL是否已设置
      if (!this.url) {
        reject(new Error('请先调用setWsUrlByIdentity设置身份和ID'));
        return;
      }

      // 3. 已连接则直接返回
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve(this.ws);
        return;
      }

      // 4. 标记重连中，开始建立连接
      this.reconnecting = true;
      // 先清除旧连接（避免内存泄漏）
      if (this.ws) {
        try {
          this.ws.close(1001, '重建连接');
        } catch (e) {
          console.warn('关闭旧WS连接失败:', e);
        }
        this.ws = null;
      }

      // 5. 创建新WS实例
      this.ws = new WebSocket(this.url);

      // 6. 连接成功回调
      this.ws.onopen = () => {
        this.reconnecting = false;
        this.isConnected = true;
        console.log('WebSocket连接成功（路径：', this.url, '）');
        clearTimeout(this.reconnectTimer); // 清除重连定时器
        resolve(this.ws);
      };

      // 7. 消息接收回调
      this.ws.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          // 处理请求响应（针对主动发送的消息）
          const callback = this.callbackMap.get(res.msgId);
          if (callback) {
            res.code === 0 ? callback.resolve(res) : callback.reject(new Error(res.msg || 'WS请求失败'));
            this.callbackMap.delete(res.msgId);
            return; // 响应类消息不进入全局监听
          }
          // 处理后端主动推送的业务消息
          this.globalMessageHandlers.forEach(handler => {
            try {
              handler(res);
            } catch (e) {
              console.error('全局消息处理器执行失败:', e);
            }
          });
        } catch (error) {
          console.error('WS消息解析失败:', error, '原始消息:', event.data);
        }
      };

      // 8. 连接关闭回调（处理异常重连）
      this.ws.onclose = (event) => {
        this.reconnecting = false;
        this.isConnected = false;
        console.log('WebSocket连接关闭:', event.code, event.reason);
        // 异常关闭（非手动关闭）则自动重连
        if (event.code !== 1000 && event.code !== 1001) {
          console.log(`WebSocket异常关闭，${this.reconnectInterval/1000}秒后尝试重连...`);
          this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      // 9. 连接错误回调
      this.ws.onerror = (error) => {
        this.reconnecting = false;
        this.isConnected = false;
        console.error('WebSocket连接错误:', error);
        reject(error);
        // 错误后触发重连（避免死循环，限制重连次数可选）
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };
    });
  }

  /**
   * 发送通用消息
   * @param {string} action 消息动作
   * @param {Object} data 消息数据
   * @returns {Promise<Object>} 后端响应结果
   */
  sendMessage(action, data) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then((ws) => {
          // 生成唯一msgId（避免重复）
          const msgId = `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const requestData = { msgId, action, data };
          // 注册回调
          this.callbackMap.set(msgId, { resolve, reject });
          // 发送消息
          ws.send(JSON.stringify(requestData));
        })
        .catch(reject);
    });
  }

  /**
   * 发送登录请求（专用方法）
   * @param {Object} data 登录参数（如token、账号密码等）
   * @returns {Promise<Object>} 登录响应结果
   */
  sendLoginRequest(data) {
    return this.sendMessage('login', data); // 复用通用发送逻辑，简化代码
  }

  /**
   * 手动关闭WebSocket连接
   * @param {string} reason 关闭原因
   */
  close(reason = '手动关闭连接') {
    // 清除重连定时器
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    // 关闭连接
    if (this.ws) {
      try {
        this.ws.close(1000, reason);
      } catch (e) {
        console.warn('关闭WS连接失败:', e);
      }
    }
    // 重置状态
    this.isConnected = false;
    this.reconnecting = false;
    this.ws = null;
  }
}

// 导出单例实例
export default new WsClient();