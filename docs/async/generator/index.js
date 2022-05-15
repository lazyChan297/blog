function* helloWorldGenerator() {
    var a = yield 'hello';
    console.log(a)
    var b = yield 'world';
    console.log(b)
    return a + b;
  }

  function hello(n) {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              resolve(n)
          }, n * 500);
      })
  } 
  
  var hw = helloWorldGenerator();
  hw.next()
  hw.next(1)
  hw.next(2)
  console.log(Promise.resolve(1))