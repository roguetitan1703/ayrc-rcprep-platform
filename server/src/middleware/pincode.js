import fetch from 'node-fetch'

export async function verifyPincode(req, res, next) {
  const { pincode, location, state } = req.body
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({ message: 'Invalid pincode format' })
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()
    if (data?.[0]?.Status !== 'Success' || !data[0].PostOffice?.length) {
      return res.status(400).json({ message: 'Pincode not found' })
    }
    // normalize: pick district/state from API
    const po = data[0].PostOffice[0]
    const apiState = (po.State || '').trim().toLowerCase()
    const apiDistrict = (po.District || '').trim().toLowerCase()

    // Accept if submitted state and location match API (allow small variations)
    const submittedState = (state || '').trim().toLowerCase()
    const submittedLocation = (location || '').trim().toLowerCase()

    if (submittedState && submittedState !== apiState) {
      return res.status(400).json({ message: 'State does not match pincode' })
    }
    if (submittedLocation && !apiDistrict.includes(submittedLocation) && !submittedLocation.includes(apiDistrict)) {
      // loose check: either contains or is contained
      return res.status(400).json({ message: 'Location does not match pincode' })
    }

    // attach verified fields to req.body
    req.verifiedLocation = {
      state: po.State,
      location: po.District,
      pincode
    }
    next() 
  } catch (e) {
    console.error('Pincode verify error', e)
    return res.status(500).json({ message: 'Could not verify pincode' })
  }
}
