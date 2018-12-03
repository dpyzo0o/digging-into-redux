/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

// 第一次看到这里, WTF? 代码居然还能这么写? 写的真是太优雅了...
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  /**
   *  扩展运算符(...)写在函数签名里和函数调用里作用是不一样的, 一开始很容易混淆, 举例如下
   * 
   * 函数签名:
   * function funcA(...args) {}, 这里的作用是将传入的多个参数组成一个数组, 也就是说
   * 调用 funcA(a, b, c) 会在函数内生成变量 args = [a, b, c]
   * 
   * 函数调用:
   * func(...args), 这里的扩展运算符是将 args 数组展开成参数传入函数 func, 也就是说
   * 如果 args = [a, b, c] 的话，func(...args) 等价于 func(a, b, c)
   * 
   */
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
