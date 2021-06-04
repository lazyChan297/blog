# 数据类型转换机制

## 触发隐式转换的场景
1. 字符串连接符和算术运算符
2. 关系运算符比较，左右两边的数据类型不一致
3. 逻辑非`!`运算符

## 转换规则
1. 字符串连接符`+`操作时，会把其他类型转换为`String`再进行拼接
2. 算术运算符号操作时`+` `-` `*` `/` `%`，会把其他类型转换为`Number`再进行相加
3. 关系运算符操作时`>` `==` `!=` `<`，会把其他类型转换为`Number`再进行比较
4. 逻辑运算符操作时`!`，会把其他类型转换为`Boolean`再进行比较
5. 引用类型在进行隐式转换时，会先调用`valueOf()`方法获得原始值，如果原始值不是`Number`类型则使用`toString()`方法转成字符串，再将字符串转换成number

## example
- 字符串连接符，会把不是字符串类型的数据转换为string再相加
`1 + 'true' = '1true'`
- 算术运算符，会把不是数字类型的数据转换为number再相加
`1 + true = 2` 
`false + false = 0`
- 关系运算符，会把不是数字类型的数据转换为number再进行比较。
（注意，如果关系运算符两边都是字符串，则字符串会调用`charCodeAt()`而不是`Number()`
```javascript
'a' > 'b' // false
'a'.charCodeAt() // 97
'b'.charCodeAt() // 98
// 相等于
'a'.charCodeAt() > 'b'.charCodeAt() // false
```
- 引用类型
```javascript
let a = {}
// a.valueOf().toString()
a == '[object Object]' // true
```
```javascript
// [].valueOf().toString // '' => Number('') => 0
[] == 0 // true
// ![] 空数组转布尔值得到true，逻辑非取反得到false false隐式转转为number变成0
![] == 0 // true

// [] 空数组转换为number变成0，![]隐式转换变为false，false再隐式转换变为0
[] == ![]
// 相同的数据类型不会触发隐式转换
[] == [] 
```

## 布尔值转换
| 数据类型          | 转换为true                  | 转换为false  |
| ---------------  | ------------------------- | -------------|
| String           | 非空字符串                  | 空字符串|
| Number           | 非零的值                    | 0，NaN |
| Object           | 非空对象(注意包括{})          | null |


