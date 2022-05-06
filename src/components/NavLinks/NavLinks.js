import * as React from "react"
import * as styles from "./NavLinks.module.css"
import { NavLink } from "react-router-dom";

const NavLinks = ({vertical, linkStyle, onSelection = null, tabIndex = 0}) => {
  const style = linkStyle ? `${linkStyle}` : styles.link;
  return (
    <nav>
      <ul className={vertical ? styles.containerVertical : styles.containerHorizontal}>
        <li>
          <NavLink
            to={"/trading/XLM:native" + 
                "/USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"}
            className={style}
            onClick={onSelection}
            tabIndex={tabIndex}
          >
            SDEX Trading
          </NavLink>
        </li>
        <li>
          <NavLink
            to={"/swap/XLM:native" + 
                "/USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"}
            className={style}
            onClick={onSelection}
            tabIndex={tabIndex}
          >
            Swap
          </NavLink>
        </li>
        <li>
          <NavLink
            to={"/liquidity-pools/XLM:native" + 
                "/USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"}
            className={style}
            onClick={onSelection}
            tabIndex={tabIndex}
          >
            Liquidity Pools
          </NavLink>
        </li>
        <li>
          <NavLink to="/aqua-tools" className={style} onClick={onSelection} tabIndex={tabIndex}>
            AQUA Tools
          </NavLink>
        </li>
      </ul>
    </nav>
  )
};

export default NavLinks;
