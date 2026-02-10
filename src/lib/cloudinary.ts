export const uploadToCloudinary = async (uri: string, userId: string) => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = "Afterpath"; // From user screenshot

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured.");
  }

  const formData = new FormData();
  // @ts-ignore
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  formData.append("upload_preset", uploadPreset);
  const shortUserId = userId.split("-")[0];
  formData.append("folder", `afterpath/users/${shortUserId}/journey-images`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.secure_url;
};
