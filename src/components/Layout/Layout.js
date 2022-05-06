import { React } from "react"
import PropTypes from "prop-types"
import * as styles from "./Layout.module.css"
import Header from "../Header/Header"
import Footer from "../Footer/Footer"

const Layout = ({ children, noHeader, noSidebar, noFooter }) => {
  return (
    <div className={styles.layout}>
      {!noHeader && <Header />}
      <main className={styles.main}>{children}</main>
      {!noFooter && <Footer />}
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  noHeader: PropTypes.bool,
  noSidebar: PropTypes.bool,
  noFooter: PropTypes.bool
}

export default Layout
