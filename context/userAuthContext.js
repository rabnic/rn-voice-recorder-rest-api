import { useContext, createContext } from "react";

export const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};
