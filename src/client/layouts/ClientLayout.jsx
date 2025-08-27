import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import QueueNotification from "../../shared/components/QueueNotification";
import queueService from "../../shared/services/queueService";
import { auth } from "../../shared/config/firebase";

const ClientLayout = () => {
  const [queueData, setQueueData] = useState(null);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const unsubscribeQueue = queueService.onQueueUpdate((queueInfo) => {
          setQueueData(queueInfo);
        });

        return () => unsubscribeQueue();
      } else {
        setQueueData(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main>
        <Outlet />
      </main>
      <Footer />

      {/* Queue Notification - shows when user has active queue */}
      {user && queueData && <QueueNotification queueData={queueData} />}
    </div>
  );
};

export default ClientLayout;
