import styles from "./Userdropdown.module.css";
import { useUser } from "../../context/UserContext"; 

export default function UserDropDown({ visible, onEnter, onLeave }) {
  const { user, signOut } = useUser();

  if (!visible || !user) return null;

  return (
    <div
      className={styles.dropdown}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={styles.item}>Profile</div>
      <div className={styles.item}>History</div>
      <div className={styles.item}>Settings</div>
      <div className={styles.item} onClick={signOut}>Log out</div>
    </div>
  );
}