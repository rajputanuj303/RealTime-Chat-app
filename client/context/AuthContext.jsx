import { createContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {io} from "socket-io-client";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSockets] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Login function to handle user authentication and socket connection

  const login = async (state, credentials) => {
    try {
      const {data} = await axios.post(`api/auth/${state}`, credentials);
      if(data.success){
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }else{
        toast.error(data.message); 
      }
    } catch (error){
      toast.error(error.message);
    }
  }

  // Connect socket function to handle socket connection and online users update
  const connectSocket = (userData) => {
    if(!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      }
    });
    newSocket.connect();
    setSockets(newSocket);

    newSocket.on("getOnlineUsers", (userIds) =>{
      setOnlineUsers(userIds);
    })
  }

  useEffect(() =>{
    if(token){
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, [])

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
