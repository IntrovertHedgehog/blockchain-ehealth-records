import axios from 'axios';

const recordClient = axios.create({
  baseURL: 'http://127.0.0.1:5001/blockchain-ehealth-records/us-central1/app',
})

export async function getRecord(id) {
  try {
    const res = await recordClient.get(`api/main-records/${id}`);
    console.log(res);
    return res.data;
  } catch(error) {
    // console.error(error);
    return '';
  }
}

export async function postRecord(record) {
  try {
    const res =  await recordClient.post('api/main-records', record);
    return res.data.identifier;
  } catch(error) {
    console.error(error);
    return '';
  }
}