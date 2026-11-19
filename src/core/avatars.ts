import avatars from '@/data/common/avatars.json'

/** Avatars to choose from (OpenMoji code points, see EmojiPicture). */
export const AVATARS: readonly { code: string; label: string }[] = avatars.map((a) => ({
  code: a.image,
  label: a.label,
}))

export const DEFAULT_AVATAR = '1F98A'
