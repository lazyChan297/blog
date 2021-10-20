# 数据类型转换机制

## 显式转换
- `Number()`
    - 原始类型
        - **string** 非空可以解析为相应的数字那么就是对应数字的值，如果其中有一个非数字那么就会转换为`NaN`，`let a = Number('1a') // NaN`，与parseInt不同 `let a = parsrInt('1a') // 1`，空字符串转换为0
        - **boolean** Number(true) => 1 Number(false) => 0
        - **symbol** 不能转换 会报错
    - 引用类型 **先调用自身类型的`valueOf`方法，如果获取的值不是原始类型，再调用自身类型的toString方法，接着将字符串规则转换**
        - **对象**`Object.valueOf()` 返回对象本身， `Object.toString()` 返回 `[object 对象类型]`
            - `Number({}) => NaN`
        - **数组**`Array.valueOf()` 返回数组本身，`Array.toString()`返回数组元素拼接的字符串用,分隔
            - `Number([1]) => 1` `Number([1,2,3]) => NaN`
- `String`
    - 原始类型
        - **number** 转换为数字字符串
        - **boolean** 转换为"true" 或者 "false"
        - **undefined** 转换为"undefined"
        - **null** 转换为"null"
    - 引用类型  **调用对象自身类型的`toString`方法，如果是原始类型则调用String函数，如果不是则调用该对象自身类型的valueOf方法，如果得到原始类型再调用String函数，如果toString和valueOf返回的仍然是引用类型就会报错**
- `Boolean` 只有这几种情况会转换为false `null`、`undefined`、 `0`、 `-0`、 `NaN`、 `''`，其它全部是true
## 隐式转换
隐式转换的规则与显式转换一致，区别在于不是用户主动调用的，而是在以下操作中自动触发
1. 不同类型数据相加
    - 如果+号的一边是字符串，那么另一边也会转换为字符串相加，`'1'+true => '1true'` 
    - 如果+号的一边是数字，那么另一边会自动转换为数字相加，`1 + true => 2`
    - 如果+号的有引用类型，会对该引用类型调用自身的valueOf和toString，接着按照字符串相加的规则执行
2. 对非数值类型使用一元运算符，会自动按照number()函数的转换规则执行
3. **if语句**、**否定运算符!**、**三目运算符** 会自动转换为boolean
4. 比较运算符 先转换为数字再进行比较，如果运算子是引用类型，先调用自身的valueOf，如果还是对象则调用自身的toString
5. 相等运算符`==`和不相等运算符`!=`
    - 字符串或布尔值与数字比较，都会自动转换为数字
    - 引用类型与原始类型比较
        - 与字符串比较，先调用自身的valueOf和toString得到原始值，`let a = {}; a == '[object Object] // true`
        - 与数字比较，引用类型转换后的字符串再调用一次Number函数得到数字再进行比较
            - `[] == 0; //true, Number([].valueOf().toString()) => 0`
            - `![] == 0; //true, ![] => false, Number(false) => 0`
            - `[] == ![]; //true, Number([].valueOf().toString()) => 0, ![]=>false,Number(false) => 0`
    - 引用类型与引用类型比较，不会触发类型转换，仅仅比较它们的引用对象是否是同一个




