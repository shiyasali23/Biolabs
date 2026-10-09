export const processDummyUserData = (entries) => entries.map((entry,index)=>{
  const created=new Date(Date.UTC(2025,3,1+index*7));
  return {...entry,created_at:created.toISOString(),biometrics:entry.biometrics.map(item=>({...item,expiry_date:new Date(created.getTime()+30*86400000).toISOString()}))};
});
