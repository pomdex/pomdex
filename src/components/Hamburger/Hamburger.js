import * as React from "react"
import PropTypes from "prop-types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import * as styles from "./Hamburger.module.css"

const Hamburger = ({menuOpen, setMenuOpen}) => (
  <button
    type='button'
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
    className={styles.button}
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <FontAwesomeIcon
      fixedWidth
      icon={menuOpen ? faTimes : faBars}
      className={menuOpen ? styles.iconMenuOpen : styles.iconMenuClosed}
    />
  </button>
)

Hamburger.propTypes = {
  menuOpen: PropTypes.bool.isRequired,
  setMenuOpen: PropTypes.func.isRequired
}

export default Hamburger