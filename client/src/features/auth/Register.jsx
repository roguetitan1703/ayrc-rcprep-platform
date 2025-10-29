import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input, PasswordInput } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { Mail, User, Phone, MapPin, Map as MapIcon, ChevronDown, AlertCircle } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const phoneInputRef = useRef(null)
  const phoneGroupRef = useRef(null)
  const [pincodeData, setPincodeData] = useState(null)
  const [availableCities, setAvailableCities] = useState([])
  const [loadingPincode, setLoadingPincode] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    city: '',
    state: '',
    pincode: '',
    password: '',
  })
  const cityDropdownRef = useRef(null)

  // Cache for pincode data to avoid repeated API calls
  const pincodeCache = useRef(new Map())

  const validatePin = (pin) => /^[1-9][0-9]{5}$/.test(pin)

  // Fetch pincode data ONCE per pincode
  const fetchPincodeData = useCallback(async (pin) => {
    if (pincodeCache.current.has(pin)) {
      return pincodeCache.current.get(pin)
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await response.json()

      if (data?.[0]?.Status === 'Success') {
        const cachedData = {
          state: data[0].PostOffice[0].State,
          postOffices: data[0].PostOffice,
          timestamp: Date.now(),
        }
        pincodeCache.current.set(pin, cachedData)
        return cachedData
      }
      return null
    } catch (error) {
      return null
    }
  }, [])

  // Extract unique, normalized cities
  const extractCities = useCallback((postOffices) => {
    const cities = new Set()
    postOffices.forEach((po) => {
      // Prioritize: Name > District > Block
      const candidates = [po.Name, po.District, po.Block].filter(Boolean)
      candidates.forEach((cityName) => {
        if (cityName && cityName.length > 2) {
          cities.add(cityName.trim())
        }
      })
    })
    return Array.from(cities).sort()
  }, [])

  // Handle pincode change and verification
  useEffect(() => {
    if (pincode.length === 6 && validatePin(pincode)) {
      const verifyPincode = async () => {
        setLoadingPincode(true)
        const data = await fetchPincodeData(pincode)

        if (data) {
          setPincodeData(data)
          setState(data.state)
          const cities = extractCities(data.postOffices)
          setAvailableCities(cities)
          setValidationErrors((prev) => ({ ...prev, pincode: '', state: '' }))

          // Cross-verify existing city selection
          if (city && !cities.includes(city)) {
            setValidationErrors((prev) => ({
              ...prev,
              city: `"${city}" is not valid for pincode ${pincode}. Please select from dropdown.`,
            }))
            setCity('') // Reset invalid city
          } else if (city && cities.includes(city)) {
            setValidationErrors((prev) => ({ ...prev, city: '' }))
          }
        } else {
          setPincodeData(null)
          setAvailableCities([])
          setState('')
          setCity('')
          setValidationErrors((prev) => ({
            ...prev,
            pincode: 'Invalid pincode. Please check and try again.',
            city: '',
            state: '',
          }))
        }
        setLoadingPincode(false)
      }

      verifyPincode()
    } else if (pincode.length === 6) {
      setValidationErrors((prev) => ({
        ...prev,
        pincode: 'Pincode must start with 1-9 and be 6 digits.',
      }))
    } else {
      setPincodeData(null)
      setAvailableCities([])
      if (pincode.length === 0) {
        setState('')
        setValidationErrors((prev) => ({ ...prev, pincode: '', city: '', state: '' }))
      }
    }
  }, [pincode, fetchPincodeData, extractCities, city])

  // City selection handler
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity)
    setShowCityDropdown(false)
    setValidationErrors((prev) => ({ ...prev, city: '' }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Validate city when user types manually
  const handleCityChange = (e) => {
    const value = e.target.value
    setCity(value)

    if (availableCities.length > 0 && value) {
      if (!availableCities.includes(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          city: 'Please select a city from the dropdown for this pincode.',
        }))
      } else {
        setValidationErrors((prev) => ({ ...prev, city: '' }))
      }
    }
  }

  // Check if location data is valid
  const isCityValid = useMemo(() => {
    return (
      pincodeData &&
      state === pincodeData.state &&
      availableCities.includes(city) &&
      !validationErrors.city &&
      !validationErrors.state &&
      !validationErrors.pincode
    )
  }, [pincodeData, state, city, availableCities, validationErrors])

  useEffect(() => {
    if (user) nav('/dashboard')
  }, [user])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ✅ Validation checks
    const phoneRegex = /^[6-9]\d{9}$/
    const pinRegex = /^[1-9][0-9]{5}$/
    const textRegex = /^[A-Za-z\s]+$/

    if (!name || !email || !password || !phoneNumber || !city || !state || !pincode) {
      setError('All fields are required.')
      setLoading(false)
      return
    }

    // Client-side enforce minimum password length to match server (8+)
    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters.'
      // set inline field error and show toast; avoid setting global error to prevent duplicate messages
      setValidationErrors((prev) => ({ ...prev, password: msg }))
      toast.show(msg, { variant: 'error' })
      setLoading(false)
      return
    }

    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.')
      setLoading(false)
      return
    }

    if (!pinRegex.test(pincode)) {
      setError('Please enter a valid 6-digit pincode.')
      setLoading(false)
      return
    }

    if (!textRegex.test(city) || !textRegex.test(state)) {
      setError('Location and State should only contain letters.')
      setLoading(false)
      return
    }

    try {
      // Combine country code and local number before sending
      const phone = `${countryCode}${phoneNumber}`
      const payload = {
        name,
        email,
        phoneNumber: phone,
        city: city,
        state,
        pincode,
        password,
        passwordConfirm: password,
      }
      // debug: ensure payload contains passwordConfirm
      console.log('Register payload ->', payload)
      // include passwordConfirm to satisfy server-side validation
      await api.post('/auth/register', payload)
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      // show toast on next tick to ensure portal has mounted
      setTimeout(() => toast.show('Account created successfully', { variant: 'success' }), 0)
      nav('/dashboard')
    } catch (err) {
      // Try to parse detailed server-side validation errors (mongoose)
      let msg = extractErrorMessage(err, 'Registration failed')
      try {
        const srv = err?.response?.data
        if (srv) {
          // mongoose validation format: { errors: { field: { message } } }
          if (srv.errors && typeof srv.errors === 'object') {
            const vals = Object.values(srv.errors)
              .map((v) => v.message)
              .filter(Boolean)
            if (vals.length) msg = vals.join(', ')
          } else if (srv.error) {
            msg = srv.error
          }
        }
      } catch (e) {
        console.warn('Error parsing server validation', e)
      }
      setError(msg)
      // ensure portal is available before showing toast
      setTimeout(() => toast.show(msg, { variant: 'error' }), 0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create Account" subtitle="Start your RC mastery journey today">
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={User}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              icon={Mail}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
            <div
              ref={phoneGroupRef}
              tabIndex={0}
              onFocus={() => {
                phoneInputRef.current?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  phoneInputRef.current?.focus()
                }
              }}
              onMouseDown={(e) => {
                // if clicking the native select, let it handle focus; otherwise forward focus to the number input
                const target = e.target
                if (
                  target &&
                  (target.tagName === 'SELECT' || (target.closest && target.closest('select')))
                )
                  return
                // ensure focus after the mouse event
                setTimeout(() => phoneInputRef.current?.focus(), 0)
              }}
              className="w-full rounded-xl border border-neutral-grey/30 bg-card-surface flex items-center overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
            >
              <div className="pl-3 pr-2 py-3 text-neutral-grey">
                {/* Dial icon */}
                <Phone className="w-5 h-5" />
              </div>
              <div className="px-3 py-2 text-sm text-text-primary">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full appearance-none bg-transparent outline-none text-text-primary text-sm cursor-pointer border-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                  tabIndex={-1}
                  aria-label="Country code"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                </select>
              </div>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                ref={phoneInputRef}
                required
                maxLength={10}
                className="flex-1 bg-transparent outline-none border-0 text-base py-3 px-1 placeholder:text-neutral-grey focus:outline-none focus:ring-0 focus-visible:outline-none"
              />
              {phoneNumber && phoneNumber.length < 10 && (
                <p className="text-error-red text-xs mt-1">Phone number must be 10 digits.</p>
              )}
            </div>
          </div>

          {/* City Field - Dropdown */}
          <div className="relative" ref={cityDropdownRef}>
            <label className="block text-sm font-medium text-text-primary mb-2">City</label>
            <div className="relative">
              <Input
                value={city}
                onChange={handleCityChange}
                onFocus={() => availableCities.length > 0 && setShowCityDropdown(true)}
                placeholder={
                  availableCities.length > 0 ? 'Select city from dropdown' : 'Enter pincode first'
                }
                icon={MapPin}
                required
                disabled={!pincodeData}
                className={`${validationErrors.city ? 'border-error-red' : ''} ${
                  !pincodeData ? 'bg-surface-muted cursor-not-allowed' : ''
                }`}
              />
              {availableCities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-grey hover:text-text-primary transition-colors"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      showCityDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            {/* City Dropdown */}
            {showCityDropdown && availableCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-grey/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {availableCities.map((cityOption) => (
                  <button
                    key={cityOption}
                    type="button"
                    onClick={() => handleCitySelect(cityOption)}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors ${
                      city === cityOption
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text-primary'
                    }`}
                  >
                    {cityOption}
                  </button>
                ))}
              </div>
            )}

            {validationErrors.city && (
              <p className="text-error-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.city}
              </p>
            )}
            {city && availableCities.includes(city) && !validationErrors.city && (
              <p className="text-success-green text-xs mt-1 flex items-center gap-1">
                ✅ Valid city for pincode {pincode}
              </p>
            )}
          </div>

          {/* state field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">State</label>
            <Input
              value={state}
              readOnly
              placeholder="Auto-filled from pincode"
              icon={MapIcon}
              required
              className="cursor-not-allowed"
              disabled={!pincodeData}
            />
            {validationErrors.state && (
              <p className="text-error-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.state}
              </p>
            )}
          </div>

          {/* pincode field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Pincode</label>
            <Input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              error={validationErrors.pincode}
              placeholder="Pincode"
              icon={MapPin}
              required
              className="input-field"
            />
            {loadingPincode && (
              <p className="text-xs text-info-blue mt-1 flex items-center gap-1">
                <span className="animate-spin">⏳</span> Verifying pincode...
              </p>
            )}
            {validationErrors.pincode && (
              <p className="text-error-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.pincode}
              </p>
            )}
            {pincodeData && !validationErrors.pincode && (
              <p className="text-success-green text-xs mt-1 flex items-center gap-1">
                ✅ Pincode verified - {availableCities.length} cities available
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => {
                const v = e.target.value
                setPassword(v)
                if (validationErrors.password && v.length >= 8) {
                  setValidationErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              placeholder="••••••••"
              required
            />
            <PasswordStrength password={password} />
            {validationErrors.password && (
              <p className="text-error-red text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>
          <Button
            className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-text-primary font-semibold hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}

function PasswordStrength({ password }) {
  if (!password)
    return (
      <p className="mt-2 text-xs text-text-secondary">Use 8+ characters with letters & numbers</p>
    )
  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0
  const varietyScore =
    /[A-Z]/.test(password) + /[0-9]/.test(password) + /[^A-Za-z0-9]/.test(password)
  const score = lengthScore + varietyScore
  const levels = [
    { label: 'Weak', color: 'bg-error-red' },
    { label: 'Fair', color: 'bg-accent-amber' },
    { label: 'Good', color: 'bg-success-green' },
    { label: 'Strong', color: 'bg-success-green' },
    { label: 'Excellent', color: 'bg-success-green' },
  ]
  const idx = Math.min(levels.length - 1, score)
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-neutral-grey/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${levels[idx].color} transition-all`}
          style={{ width: `${((idx + 1) / levels.length) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-text-secondary">Strength: {levels[idx].label}</p>
    </div>
  )
}
