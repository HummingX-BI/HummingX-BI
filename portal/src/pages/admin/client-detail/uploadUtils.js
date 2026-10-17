// portal/src/pages/admin/client-detail/uploadUtils.js
export async function uploadLogoToCloudinary(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'hummingx_logos');
  const uploadRes = await fetch('https://api.cloudinary.com/v1_1/dazt6k8vi/image/upload', {
    method: 'POST',
    body: formData,
  });
  const uploadData = await uploadRes.json();
  return uploadData.secure_url || null;
}
