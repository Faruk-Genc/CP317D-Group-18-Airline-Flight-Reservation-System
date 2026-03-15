import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import loadingAnimation from "../../assets/animation/loading.json"; 

export default function Loader({ hide }) {
  const container = useRef(null);

  useEffect(() => {
    if (hide) return; 

    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loadingAnimation,
    });

    return () => anim.destroy(); 
  }, [hide]);

  if (hide) return null; 

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
    }}>
      <div ref={container} style={{ width: 200, height: 200 }}></div>
    </div>
  );
}