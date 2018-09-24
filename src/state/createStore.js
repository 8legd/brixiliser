import { createStore as reduxCreateStore } from 'redux'

const reducer = (state, action) => {
  if (action.type === `SET_POKEMON`) {
    return {
      ...state,
      pokemonid: action.payload.id,
      imageURL: require('../images/sprites/pokemon/' +
        action.payload.id +
        '.png'),
    }
  }
  return {
    ...state,
  }
}

const initialState = {
  // count: 0,
  imageURL: require('../images/sprites/pokemon/2.png'),
  pokemonid: 2,
}

const createStore = () =>
  reduxCreateStore(
    reducer,
    initialState /* preloadedState, */,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
export default createStore
