// TASK ZJ:

// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.

// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.

function reduceNestedArray(arr) {
  let sum = 0;

  for (let item of arr) {
    if (typeof item === 'number') {
      sum += item;
    } else if (Array.isArray(item)) {
      sum += reduceNestedArray(item)
    }
  }

  return sum;
}
console.log(reduceNestedArray([1,2,3,[1,3,8]]))