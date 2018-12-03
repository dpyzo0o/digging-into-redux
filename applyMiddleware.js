import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  // 传入 createStore 是为了对原来的 dispatch 做修改
  // 返回一个函数相当于新的 createStore, 用来接收 reducer 和 preloadedState
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    // 只暴露 getState 和 dispatch 两个方法给 enhance
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // 给所有的 middleware 传入原 store 的 getState 和 dispatch 方法
    // 回忆一下 middleware 的函数签名 store => next => action => {}
    // middlewareAPI 就是第一个参数 store
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 上一行执行完后 chain 包含的函数签名为 next => action => {}, 这里的 next 其实就是
    // dispatch 函数, 因为在实际的函数体内会执行 next(action) 这一步. store.dispatch
    // 作为第一个 next 传入, 然后每个 middleware 中返回的 action => {} 作为下一级
    // middleware 的 next 参数传入进行链式调用. 这里得到最终的 dispatch 实际上就是 compose
    // 中传入的第一个 middleware 内部的 action => {}, 这样传入的 action 通过不断调用 next(action)
    // 流经所有 middleware, 执行相应 middleware 的操作, 最终进入 store.dispatch 进行处理，
    // 返回一个 state 对象.
    dispatch = compose(...chain)(store.dispatch)

    // 用更新后的 dispatch 覆盖原 dispatch, 这里也是用到了扩展运算符(...)的特性. 关于扩展运算符
    // 用法推荐阅读 https://dmitripavlutin.com/object-rest-spread-properties-javascript/
    return {
      ...store,
      dispatch
    }
  }
}
