import React from 'react'
import { Link } from 'gatsby'
import { connect } from 'react-redux'

const Header = ({ siteTitle, pokemonid, setPokemon }) => (
  <header
    style={{
      background: '#D11013',
      marginBottom: '1.45rem',
    }}
  >
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '1.45rem 1.0875rem',
      }}
    >
      <h1 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
          }}
        >
          {siteTitle}
        </Link>
      </h1>
      {pokemonid}
      <button onClick={() => setPokemon(parseInt(pokemonid, 10) + 1)}>
        Next
      </button>
      <button onClick={() => setPokemon(parseInt(pokemonid, 10) - 1)}>
        Prev
      </button>
    </div>
  </header>
)

export default connect(
  (state, props) => {
    return {
      pokemonid: state.pokemonid,
    }
  },
  dispatch => {
    return {
      setPokemon: id => {
        dispatch({
          type: 'SET_POKEMON',
          payload: {
            id,
          },
        })
      },
    }
  }
)(Header)
