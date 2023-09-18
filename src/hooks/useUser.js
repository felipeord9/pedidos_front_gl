import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/authContext"
import { userLogin } from "../services/authService"

export default function useUser() {
  const { token, setToken } = useContext(AuthContext)
  const [state, setState] = useState({
    loading: false,
    error: false
  })

  const login = useCallback(({ username, password }) => {
    setState({ isLoading: true, error: false })
    userLogin({ username, password })
      .then((data) => {
        window.localStorage.setItem("token", JSON.stringify(data.token))
        setState({ isLoading: false, error: false })
        setToken(data.user)
      })
      .catch((err) => {
        window.localStorage.removeItem("token")
        setState({ isLoading: false, error: true })
        setTimeout(() => setState({ isLoading: false, error: false }), 3000)
      })
  }, [setToken])

  const logout = useCallback(() => {
    window.localStorage.removeItem("token")
    setToken(null)
  }, [setToken])

  return {
    isLogged: Boolean(token),
    isLoginLoading: state.loading,
    hasLoginError: state.error,
    login,
    logout
  }
}