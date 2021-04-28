# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
echo 'www.72lsy.vip' > CNAME

git init
git config user.name 'lazyChan297'
git config user.email 'lazyChan297@163.com'
git add -A
git commit -m '基于 vuepress 开发的博客'

git push -f git@github.com:lazyChan297/lazyChan297.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -