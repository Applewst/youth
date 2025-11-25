<template>
  <footer class="footer">
    <div class="w">
      <div class="copyright">
        <img src="@/img/bases/logo.png" alt="青年之家" />
        <p>
          青年在线，旨在为大学生们设置更加全面、完善的大学课余生活活动安排<br />
          Dedicated to serving college students
        </p>
        <a href="#" class="like-btn">给我们点个赞吧</a>
      </div>
      <div class="links">
        <dl>
          <dt>关于青年在线网</dt>
          <dd><a href="#">关于我们</a></dd>
          <dd><a href="#">工作机会</a></dd>
          <dd><a href="#">客户服务</a></dd>
          <dd><a href="#">帮助</a></dd>
        </dl>
        <dl>
          <dt>新手指南</dt>
          <dd><a href="#">如何登录注册</a></dd>
          <dd><a href="#">如何修改标签</a></dd>
          <dd><a href="#">如何参与活动</a></dd>
          <dd><a href="#">二课积分的要求</a></dd>
          <dd><a href="#">什么是二课活动</a></dd>
        </dl>
        <dl>
          <dt>合作伙伴</dt>
          <dd><a href="#">合作群聊</a></dd>
          <dd><a href="#">合作伙伴</a></dd>
        </dl>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  padding: 40px 0 20px;
  margin-top: 60px;
}

.footer .w {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.copyright {
  flex: 1;
  max-width: 400px;
}

.copyright img {
  height: 40px;
  margin-bottom: 16px;
}

.copyright p {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: #bdc3c7;
}

.like-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.like-btn:hover {
  background: #2980b9;
}

.links {
  display: flex;
  gap: 40px;
}

.links dl {
  margin: 0;
}

.links dt {
  font-weight: 600;
  margin-bottom: 12px;
  color: #ecf0f1;
}

.links dd {
  margin: 0 0 8px 0;
}

.links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.links a:hover {
  color: #3498db;
}
</style>
