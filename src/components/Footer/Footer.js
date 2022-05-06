import * as React from "react"
import PropTypes from "prop-types"
import * as styles from "./Footer.module.css"

const Footer = ({ siteTitle }) => (
  <footer>
      <div className={styles.footer}>
        <p className={styles.copyright}>© {new Date().getFullYear()} PomDEX</p>
      </div>
  </footer>
)

Footer.propTypes = {
  siteTitle: PropTypes.string,
}

Footer.defaultProps = {
  siteTitle: ``,
}

export default Footer