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

<img src="imgs\apple_stream.png" alt="apple_stream" style="zoom:50%;" />

###### observable stream

<img src="imgs\apple_stream_observable_stream.png" alt="apple_stream_observable_stream" style="zoom: 33%;" />

###### terms

<img src="imgs\terms.png" alt="terms" style="zoom: 33%;" />

##### 3.2 Observer / Subscribler

观察者是我们用来观察 rxjs 内部流的接口，实现观察者接口的类是订阅者，每个观察者都会转换为订阅者

<img src="imgs\subscriber.png" alt="subscriber" style="zoom:33%;" />

<img src="imgs\observer.png" alt="observer" style="zoom:33%;" />

##### 3.3 Observable Stream

<img src="imgs\observable_stream.png" alt="observable_stream" style="zoom:33%;" />

<img src="imgs\observable.png" alt="observable" style="zoom:33%;" />

##### 3.4 Starting the Observable Stream / Subscription

<img src="imgs\subscription.png" alt="subscription" style="zoom:33%;" />

<img src="imgs\subscription_2.png" alt="subscription_2" style="zoom:33%;" />

##### 3.5 Stopping the Observable Stream

<img src="imgs\stop_observable_stream.png" alt="stop_observable_stream" style="zoom:33%;" />

<img src="imgs\unsubscribe.png" alt="unsubscribe" style="zoom:33%;" />

##### 3.6 Creation Functions

Creating an Observable, 可以使用 observable 构造函数 new 一个，但更推荐用 ng 内置的静态函数，如 of、from

<img src="imgs\creation_functions.png" alt="creation_functions" style="zoom:33%;" />

of 函数将每一个参数都发到 stream 中，from 将数据结构中的每个元素发到 stream 中

<img src="imgs\of_from.png" alt="of_from" style="zoom:33%;" />

<img src="imgs\fromevent_interval.png" alt="fromevent_interval" style="zoom:33%;" />

