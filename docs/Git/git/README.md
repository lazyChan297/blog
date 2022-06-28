# 超越Git基础 

- push & fetch & pull

- fetch

该命令只是拉取远程仓库中最新记录，并不会对你本地仓库进行修改；
`git fetch`时会拉取全部的全程分支
`git fetch origin remoteBranchName:localBranchName`， 将远程仓库的originBranchName分支拉取到本地的localBranchName
当远程分支参数为空时 git fetch origin  :xxx 会在本地新建一个xxx分支

- 从远程仓库拉取某一个分支到本地

方法1: `git checkout -b xxx origin/xxx`，就可以在本地检出xxx分支并跟踪远程分支xxx

方法2: `git branch -u origin/xxx xxx`，这样本地分支xxx就可以跟踪远程分支，如果你已经切换到xxx分支那么后面的参数可以省略

- git pull的诞生

本地仓库想要同步远程仓库的更新，fetch后必然要合并，那么也就是`git merge origin/xxx`
为了简化这一操作，就有了 `git pull`

常见场景，周一提交了v1版本的代码，
周二你的伙伴提交了v2版本的代码，
当你周三开发好之后你所负责的功能v3想要push时，
发现你本地的origin/xxx 和远程的 origin/xxx 不一致，此时git仓库并不会允许你提交你，所以需要先拉取代码进行合并才能够提交

解决方法
1. git pull 就是 git fetch + git merge origin/xxx 的简写，（会在你的git历史中增加一次合并的提交）
2. git pull --rebase 就是 git fetch + git rebase origin/xxx 的简写

- push
拉取、合并、是自己本地仓库是基于远程仓库最新的提交记录开发完成之后，就可以向远程仓库push你的代码了。
假如想要提交到指定的远程分支，可以使用
`git push origin branchName` origin是远程仓库的名字，branchName是远程仓库中你想要push的目标分支,同时也是你本地分支的名字，
那么 当本地分支名字与远程分支名字不一致时，使用以下命令
`git push origin localBranchName:remoteBranchName`
当远程分支参数为空时 git push origin :xxx 的时候，会把远程仓库的xxx分支删除

- 神奇的rebase
`git rebase xxx1` 将xxx1分支的提交变基到所在的分支
`git rebase xxx1 xxx2` 将xxx1分支的提交变基到xxx2分支，修改的是xxx2分支
`git rebase -i`

通过视图来更改提交记录
`git rebase -i HEAD~num` 
常见场景，某一feature分支上debugger的记录提交太多，不想保留在commits中，通过该命令，
会在terminal出现一个git log列表，keydown 对应的按钮 可以执行对应的操作


- 指针HEAD

1. 指向某一个提交
指针，HEAD默认指向当前分支的最近一次（上一次）提交，通过移动指针HEAD，可以指向某一次提交记录；
`git checkout HEAD fed2da64c0efc5293610bdd892f82a58e8cbc5d8`，哈希值可以通过`git log`查看

2. 相对引用
使HEAD指向当前提交的父节点，`git checkout HEAD^`，`^`表示向上移动一个节点，所以`git checkout HEAD^^`即父节点的父节点
向上移动n个节点，推荐你使用`git checkout HEAD～n`, `n`的值就是你向上移动的节点数
记住，每执行一次*移动HEAD*，指针也会随之移动，不再是你当前分支的最近一次提交记录了。

3. 强制分支移动到某一个节点
`git branch -f branchName 节点哈希值` 也可以 `git branch -f branchName HEAD～n`，记住 使用`git branch -f ...`改变的是分支而不是HEAD

- 撤销变更
`reset`会改变提交历史，commit遗弃；
例如`git reset --mixed`(默认是mixed) 遗弃的是暂存区的commit；
例如`git reset --hard`，遗弃的是暂存区的commit，工作区也会回退，遗弃改变的内容；
例如`git reset --soft`，暂存区、工作区都不会改变；
例如`git reset HEAD~1` 或者 `git reset <hash>`取消上一次commit或某一次的提交，
对于本地分支（没有被push的commit）而言，使用`reset`就可以把提交历史抹掉；

`revert` 会「增加一段抹掉的历史的历史」，例如提交&push了c1版本，`revert`后会在提交的时间线上增加`c1‘`，对于内容而言和`reset`一致，区别在于提交历史的表现不同

- cherry-pick
`git cherry-pick {num}^` 将指定的提交移动复制到当前分支上，可以复制多个以空格隔开


