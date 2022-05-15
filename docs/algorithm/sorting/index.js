var quickSort = function (arr) {
    if (arr.length <=1) return arr
    // 找到中间数索引
    var middleIndex = Math.floor(arr.length / 2)
    // 找到中间数
    var middle = arr.splice(middleIndex, 1)[0];
    console.log('middle', middle);
    var left = [];
    var right = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < middle) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    // console.log(left, right)
    return quickSort(left).concat([middle], quickSort(right))
}

let array = [2,3,6,1,7]
console.log(quickSort(array))

// 冒泡排序
function bubbleSort(arr) {
    let i = arr.length - 1;

    while (i > 0) {
        let pos = 0;
        for (let j = 0; j < i; j++) {
            if (arr[j] > arr[j + 1]) {
                pos = j;
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        i = pos;
    }
    console.log(arr);
}