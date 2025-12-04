import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const BASE_URL = 'http://localhost:3001'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [nombre, setNombre] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [saludo, setSaludo] = useState('')
  const [error, setError] = useState('')

  const onRegister = async () => {
    setError('')
    const body = { nombre, apellidoPaterno, apellidoMaterno, correo, password }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        setError('Error al registrar')
        return
      }
      const data = await res.json()
      setSaludo(`Bienvenido ${data.nombre}`)
      setScreen('home')
    } catch (e) {
      setError('Error de red')
    }
  }

  const onLogin = async () => {
    setError('')
    const body = { correo, password }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        setError('Credenciales inválidas')
        return
      }
      const data = await res.json()
      setSaludo(`Bienvenido ${data.nombre}`)
      setScreen('home')
    } catch (e) {
      setError('Error de red')
    }
  }

  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <View style={styles.card}>
          <Text style={styles.title}>{saludo}</Text>
        </View>
      )}

      {screen === 'login' && (
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={onLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('register')}>
            <Text style={styles.link}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'register' && (
        <View style={styles.card}>
          <Text style={styles.title}>Registro</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Apellido paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} />
          <TextInput style={styles.input} placeholder="Apellido materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} />
          <TextInput style={styles.input} placeholder="Correo" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={onRegister}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('login')}>
            <Text style={styles.link}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    width: '90%',
    maxWidth: 420,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#4a67f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    marginTop: 12,
    color: '#4a67f5',
    textAlign: 'center',
  },
  error: {
    marginTop: 8,
    color: 'red',
  },
});
