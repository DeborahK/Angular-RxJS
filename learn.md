##### 2.2 What is RxJS?

RxJS is **R**eactive E**x**tensions for **J**ava**S**cript，响应式扩展

RxJS 是一个库，用于通过可观察的序列，处理异步和事件。

###### Why is RxJS?

**Callbacks** 可以在异步操作完成后的回调函数，但在嵌套异步操作时，回调可能去下很难管理

**Promises**是将来可能会产生单个值的对象，它只能处理一次发射，并且不能取消

**async/await**是一种特殊语法，它允许编写看起来是同步的代码，它也只能处理一次发射，并不不能取消

**RxJS**提供了一种处理任何类型数据的统一技术，可以取消异步操作

<img src="imgs\why_rxjs.png" alt="why_rxjs" style="zoom:50%;" />

**3.1 苹果流**

