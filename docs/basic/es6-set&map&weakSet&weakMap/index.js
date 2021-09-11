let a = {
    id: 1
}
let b = {
    id: 2
}

let weakSet = new WeakSet()
weakSet.add(a)
weakSet.add(b)
console.log('清除前')
console.log(weakSet.has(a))

a = null
console.log('清除后')
console.log(weakSet.has(a))

let set = new Set()
set.add(1)
set.add(2)
set.add({name: 'name'})

console.log(set.keys())
console.log(set.values())
console.log(set.entries())

let map = new Map()
let a1 = {
    id: 1
}
let a2 = {
    id: 1
}
map.set(a2, 1)
map.set(a1, 1)

console.log(map)

