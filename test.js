import tap, { test } from 'tap';
import { createStore, applyMiddleware } from 'redux';
import { schema } from 'normalizr';

import normalizrMiddleware from './index';

function mergeReducer(state = {}, action) {
  return action.payload;
}

// from the normalizr readme
const article = new schema.Entity('articles');
const user = new schema.Entity('users');
const collection = new schema.Entity('collections');

article.define({
  author: user,
  collections: [collection]
});

collection.define({
  curator: user
});

const articlesSchema = {
  articles: [article]
};

const response = {
  articles: [{
    id: 1,
    title: 'Some Article',
    author: {
      id: 7,
      name: 'Dan'
    }
  }, {
    id: 2,
    title: 'Another Article',
    author: {
      id: 9,
      name: 'Will'
    }
  }]
};

const expected = {
  result: {
    articles: [1, 2]
  },
  entities: {
    articles: {
      1: {
        id: 1,
        title: 'Some Article',
        author: 7,
      },
      2: {
        id: 2,
        title: 'Another Article',
        author: 9,
      }
    },
    users: {
      7: {
        id: 7,
        name: 'Dan'
      },
      9: {
        id: 9,
        name: 'Will'
      }
    }
  }
};

test('normalizes payload with FSA defaults', t => {
  const createStoreWithNormalizr =
    applyMiddleware(normalizrMiddleware())(createStore);

  const store = createStoreWithNormalizr(mergeReducer);
  store.dispatch({
    type: 'FOO',
    payload: response,
    meta: {
      schema: articlesSchema
    }
  })

  tap.deepEqual(store.getState(), expected);
  t.done();
})

test('action is unmodified before middleware', t => {
  const toDispatch = {
    type: 'FOO',
    payload: response,
    meta: {
      schema: articlesSchema
    }
  };

  const beforeMiddleware = store => next => action => {
    tap.equal(action, toDispatch);
    next(action);
    t.done()
  }

  const store =
    applyMiddleware(
      beforeMiddleware,
      normalizrMiddleware()
    )(createStore)(mergeReducer);

  store.dispatch(toDispatch)
})

test('preserves other action properties when normalizing', t => {
  const toDispatch = {
    type: 'FOO',
    payload: response,
    meta: {
      schema: articlesSchema,
      some: 'other',
      meta: 'data'
    }
  };

  const afterMiddleware = store => next => action => {
    tap.notEqual(action, toDispatch);
    tap.notEqual(action.payload, toDispatch.payload);
    tap.equal(action.type, toDispatch.type);
    tap.equal(action.meta, toDispatch.meta);
    next(action);
    t.done()
  }

  const store =
    applyMiddleware(
      normalizrMiddleware(),
      afterMiddleware
    )(createStore)(mergeReducer);

  store.dispatch(toDispatch)
})
