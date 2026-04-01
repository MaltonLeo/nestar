// TASK-ZK:

// Shunday function yozing, u har soniyada
//  bir marta consolega 1 dan 5 gacha bolgan
//   raqamlarni chop etsin va 5 soniyadan
//    keyin ishini toxtatsin.
// MASALAN: printNumbers()

function printNumbers() {
  let i = 1;

  const interval = setInterval(() => {
    console.log(i)
    i++
     if (i > 5) {
      clearInterval(interval);
    }
  }, 1000);
}
printNumbers()

// // TASK ZJ:

// // Shunday function yozing, u berilgan array ichidagi
// // raqamlarni qiymatini hisoblab qaytarsin.

// // MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// // Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// // bizning function ularning yig'indisini hisoblab qaytarmoqda.

// function reduceNestedArray(arr) {
//   let sum = 0;

//   for (let item of arr) {
//     if (typeof item === 'number') {
//       sum += item;
//     } else if (Array.isArray(item)) {
//       sum += reduceNestedArray(item)
//     }
//   }

//   return sum;
// }
// console.log(reduceNestedArray([1,2,3,[1,3,8]]))