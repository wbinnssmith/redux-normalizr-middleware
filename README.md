# redux-normalizr-middleware
Combines the power of redux middleware and @gaearon's
[normalizr](https://github.com/gaearon/normalizr) to make flattening
relational, nested data a snap.

Use with [redux-thunk](https://github.com/gaearon/redux-thunk) or
[redux-promise-middleware](https://github.com/pburtchaell/redux-promise-
middleware) to easily request and store your API's response in a
database-like fashion in your redux apps!

For an example of a more manual implementation, check out [the
real-world example in redux](https://github.com/rackt/redux/tree/master/examples/real-world)

## Installation
`npm install --save redux-normalizr-middleware`

## Usage
Place this middleware before anything that expects flattened
data, and after anything that makes the nested data available (so before
something like [redux-thunk] or [redux-promise-middleware]).

redux-normalizr-middleware assumes that your actions comply with FSA and
that your nested data is available as the `payload` property in your
action, and will normalize and store the flattened data in the same
`payload` property. Opt into redux-normalizr-middleware by supplying a
[normalizr schema] as `schema` in your action's `meta` object.

## Example
```js
  import normalizrMiddleware from 'redux-normalize-middleware';

  // import a schema defined using normalizr's `Schema`s to apply
  // to the response
  import todoSchema from './todo-schema';

  const createStoreWithNormalizr =
    applyMiddleware(normalizrMiddleware())(createStore);

    // See the redux real-world example for this reducer pattern
    const store = createStoreWithNormalizr({
      entitiesReducer: () => {},
      todosByAuthor: () => {}
    });

  // This could be dispatched from redux-thunk or redux-promise-middleware
  store.dispatch({
    type: 'TODO_RECEIVED',
    payload: nestedTodoResponse,
    meta: {
      schema: todoSchema
    }
  });
```

In the above, middlware following redux-normalizr-middleware and reducers
connected to the redux store will receive the action payload as normalized,
flattened data with `entities` and `results`!
