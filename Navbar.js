import React, { useState, useEffect } from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { auth, firestore } from '../../database/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ isCollapsed }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const q = query(
                        collection(firestore, "admin"),
                        where("email", "==", user.email)
                    );
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        console.log("No admin account found.");
                        setCurrentUser(null);
                        navigate('/LoginPage');
                    } else {
                        const userData = querySnapshot.docs[0].data();
                        setCurrentUser(userData);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setCurrentUser(null);
                    navigate('/LoginPage');
                }
            } else {
                setCurrentUser(null);
                navigate('/LoginPage');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success('Signed out successfully');
            navigate('/LoginPage');
        } catch (error) {
            toast.error('Error signing out');
        }
    };

    return (
        <div className={`bg-gray-900/50 backdrop-blur-sm p-5 border-b border-red-500/20 fixed top-0 right-0 h-16 flex items-center justify-between px-6 z-10 transition-all duration-300 ${isCollapsed ? 'lg:left-16' : 'lg:left-64'
            } left-0`}>
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">Nexus AI Solutions</h1>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-red-500/10 rounded-full relative">
                    <FaBell className="text-gray-300 text-xl" />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notifications.length}
                        </span>
                    )}
                </button>

                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        {currentUser ? (
                            <>
                                <p className="text-sm font-medium text-white">
                                    {`${currentUser.firstname} ${currentUser.lastname}`}
                                </p>
                                <p className="text-xs text-gray-400">{auth.currentUser?.email}</p>
                            </>
                        ) : (
                            <div className="animate-pulse">
                                <div className="h-4 w-24 bg-red-500/20 rounded mb-1"></div>
                                <div className="h-3 w-32 bg-red-500/20 rounded"></div>
                            </div>
                        )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        {currentUser ? (
                            <FaUserCircle className="text-red-500 text-xl" />
                        ) : (
                            <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
                        )}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-2 hover:bg-red-500/10 rounded-full text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <FaSignOutAlt className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;