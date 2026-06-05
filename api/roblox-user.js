const FALLBACK_AVATAR = 'https://t7.rbxcdn.com/180DAY-a17918617b20ac9c39b305241f23e58a';

module.exports = async function handler(req, res) {
  const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      error: 'Invalid username',
    });
  }

  try {
    const lookupResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
    });

    if (!lookupResponse.ok) {
      throw new Error('Roblox username lookup failed');
    }

    const lookup = await lookupResponse.json();
    const user = Array.isArray(lookup.data) ? lookup.data[0] : null;

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    let avatarUrl = FALLBACK_AVATAR;
    const thumbnailUrl = new URL('https://thumbnails.roblox.com/v1/users/avatar-headshot');
    thumbnailUrl.searchParams.set('userIds', String(user.id));
    thumbnailUrl.searchParams.set('size', '150x150');
    thumbnailUrl.searchParams.set('format', 'Png');
    thumbnailUrl.searchParams.set('isCircular', 'false');

    const thumbnailResponse = await fetch(thumbnailUrl);
    if (thumbnailResponse.ok) {
      const thumbnail = await thumbnailResponse.json();
      const image = Array.isArray(thumbnail.data) ? thumbnail.data[0] : null;
      if (image && typeof image.imageUrl === 'string') {
        avatarUrl = image.imageUrl;
      }
    }

    return res.status(200).json({
      userId: user.id,
      username: user.name,
      displayName: user.displayName || user.name,
      avatarUrl,
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Roblox API unavailable',
    });
  }
};
