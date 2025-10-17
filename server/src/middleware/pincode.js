import axios from 'axios'

export async function verifyPincode(req, res, next) {
  const { pincode, location, state } = req.body

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({ message: 'Invalid pincode format' })
  }

  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = response.data

    if (data?.[0]?.Status !== 'Success' || !data[0].PostOffice?.length) {
      return res.status(400).json({ message: 'Pincode not found' })
    }

    const po = data[0].PostOffice[0]
    const apiState = (po.State || '').trim().toLowerCase()
    const apiDistrict = (po.District || '').trim().toLowerCase()

    const submittedState = (state || '').trim().toLowerCase()
    const submittedLocation = (location || '').trim().toLowerCase()

    if (submittedState && submittedState !== apiState) {
      return res.status(400).json({ message: 'State does not match pincode' })
    }

    if (
      submittedLocation &&
      !apiDistrict.includes(submittedLocation) &&
      !submittedLocation.includes(apiDistrict)
    ) {
      return res.status(400).json({ message: 'Location does not match pincode' })
    }

    req.verifiedLocation = {
      state: po.State,
      location: po.District,
      pincode,
    }

    next()
  } catch (e) {
    console.error('Pincode verify error', e)
    return res.status(500).json({ message: 'Could not verify pincode' })
  }
}
