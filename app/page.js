"use client";

import { useState } from "react";
import JigsawPuzzle from "@/components/puzzle/JigsawPuzzle";
import Transition from "@/components/ui/Transition";
import Hero from "@/components/invitation/Hero";
import Letter from "@/components/invitation/Letter";
import Gallery from "@/components/invitation/Gallery";
import Calendar from "@/components/invitation/Calendar";
import Location from "@/components/invitation/Location";
import Account from "@/components/invitation/Account";
import Rsvp from "@/components/invitation/Rsvp"; // Import Rsvp
import Guestbook from "@/components/social/Guestbook";
import PhotoUpload from "@/components/social/PhotoUpload";
import Toast from "@/components/ui/Toast";
import BgmPlayer from "@/components/ui/BgmPlayer";

export default function Home() {
  const [phase, setPhase] = useState("puzzle"); // puzzle | transition | invitation
  const [toastMsg, setToastMsg] = useState("");

  const handlePuzzleComplete = () => {
    setPhase("transition");
  };

  const handleTransitionEnd = () => {
    setPhase("invitation");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  return (
    <>
      {phase === "puzzle" && (
        <JigsawPuzzle onComplete={handlePuzzleComplete} onSkip={handlePuzzleComplete} />
      )}

      {phase === "transition" && (
        <Transition onEnd={handleTransitionEnd} />
      )}

      {phase === "invitation" && (
        <main>
          <BgmPlayer />
          <div id="hero-section"><Hero /></div>
          <div id="letter-section"><Letter /></div>
          <div id="gallery-section"><Gallery /></div>
          <div id="calendar-section"><Calendar /></div>
          <div id="location-section"><Location /></div>
          <div id="rsvp-section"><Rsvp /></div> {/* Rsvp 추가 */}
          <div id="account-section"><Account showToast={showToast} /></div>
          <div id="guestbook-section"><Guestbook /></div>
          <div id="photo-section"><PhotoUpload /></div>
          <footer className="footer">
            <p className="footer-names">준수 ♥ 윤겸</p>
            <p className="footer-date">2029. 03. 31</p>
          </footer>
        </main>
      )}

      <Toast message={toastMsg} />
    </>
  );
}
