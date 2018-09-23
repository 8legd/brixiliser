import { createStore as reduxCreateStore } from 'redux'

const reducer = (state, action) => {
  // if (action.type === `INCREMENT`) {
  //   return Object.assign({}, state, {
  //     count: state.count + 1,
  //   })
  // }
  return {
    ...state,
  }
}

const initialState = {
  // count: 0,
  // imageURL: require('../images/sprites/pokemon/25.png'),
}

const createStore = () =>
  reduxCreateStore(
    reducer,
    initialState /* preloadedState, */,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
export default createStore
