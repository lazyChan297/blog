# Set Map WeakSet WeakMap

## Set
### 创建集合
集合只能是唯一值，重复添加无效
`let set = new Set()`

### 添加值
`set.add(1)`

### 判断是否有值
`set.has(1)`

### 清空集合
`set.clear()`

### 删除某个值
`set.delete(1)`

## WeakSet
与set的区别是只能保存引用对象，不能保存静态值
such as
创建一个引用类型，`let man = {name: 'jack'}`添加到`Weakset`中
实际上`Weakset`保存的是`man`引用对象指向内存的指针而不是内存本身
当`man`不再被其它对象所引用，例如`man = null`，
此时`wackSet.has(man)`也会变为false

## map
普通的`Object`类型的键值只能以字符串来命名，map则可以使用引用类型
只要引用类型指向的是不同的内存地址，那么就可以当成是两个不同的key

## WeakMap
和`WeakSet`类似，只能使用弱引用对象作为key值，value随意，所以也和`WeakSet`一样，不能遍历，key值会被外部对象的改变影响

