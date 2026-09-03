export interface AvatarOption {
  id: string;
  url: string;
  gradient: string;
  gender: 'female' | 'male';
  category: 'all' | 'female' | 'male' | 'streetwear' | 'sunglasses';
}

export const AVATAR_CATEGORIES = [
  { id: 'all', label: '✨ Tous les Bitmojis (100)' },
  { id: 'female', label: '👩 Féminins (50)' },
  { id: 'male', label: '👨 Masculins (50)' },
  { id: 'streetwear', label: '🧢 Streetwear & Style' },
  { id: 'sunglasses', label: '🕶️ Lunettes & Chic' },
] as const;

export const CHARACTER_AVATARS: AvatarOption[] = [
  {
    "id": "snap-f-1",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_1",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-2",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_2",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-3",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_3",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-4",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_4",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-5",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_5",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-6",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_6",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-7",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_7",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-8",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_8",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-9",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_9",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-10",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_10",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-11",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_11",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-12",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_12",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-13",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_13",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-14",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_14",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-15",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_15",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-16",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_16",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-17",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_17",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-18",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_18",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-19",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_19",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-20",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_20",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-21",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_21",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-22",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_22",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-23",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_23",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-24",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_24",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-25",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_25",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-26",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_26",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-27",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_27",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-28",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_28",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-29",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_29",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-30",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_30",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-31",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_31",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-32",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_32",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-33",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_33",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-34",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_34",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-35",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_35",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-36",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_36",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-37",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_37",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-38",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_38",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-39",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_39",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-40",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_40",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-41",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_41",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-42",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_42",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-43",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_43",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-44",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiFemaleStylish_adventurer_44",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-45",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiFemaleStylish_personas_45",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-f-46",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiFemaleStylish_open-peeps_46",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-47",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiFemaleStylish_big-smile_47",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-48",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiFemaleStylish_micah_48",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "female",
    "category": "streetwear"
  },
  {
    "id": "snap-f-49",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiFemaleStylish_avataaars_49",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "female",
    "category": "female"
  },
  {
    "id": "snap-f-50",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiFemaleStylish_lorelei_50",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "female",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-1",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_1",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-2",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_2",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-3",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_3",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-4",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_4",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-5",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_5",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-6",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_6",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-7",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_7",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-8",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_8",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-9",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_9",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-10",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_10",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-11",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_11",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-12",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_12",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-13",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_13",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-14",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_14",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-15",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_15",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-16",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_16",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-17",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_17",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-18",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_18",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-19",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_19",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-20",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_20",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-21",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_21",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-22",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_22",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-23",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_23",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-24",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_24",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-25",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_25",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-26",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_26",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-27",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_27",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-28",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_28",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-29",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_29",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-30",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_30",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-31",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_31",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-32",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_32",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-33",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_33",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-34",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_34",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-35",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_35",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-36",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_36",
    "gradient": "from-emerald-400 via-teal-500 to-cyan-600",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-37",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_37",
    "gradient": "from-violet-500 via-purple-600 to-pink-600",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-38",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_38",
    "gradient": "from-[#FFFC00] via-lime-400 to-emerald-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-39",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_39",
    "gradient": "from-fuchsia-600 via-purple-600 to-violet-700",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-40",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_40",
    "gradient": "from-blue-500 via-cyan-400 to-teal-400",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-41",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_41",
    "gradient": "from-rose-500 via-[#FFFC00] to-yellow-400",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-42",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_42",
    "gradient": "from-indigo-600 via-purple-500 to-[#FFFC00]",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-43",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_43",
    "gradient": "from-[#FFFC00] via-yellow-400 to-amber-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-44",
    "url": "https://api.dicebear.com/7.x/adventurer/svg?seed=BitmojiMaleStylish_adventurer_44",
    "gradient": "from-pink-500 via-rose-500 to-purple-600",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-45",
    "url": "https://api.dicebear.com/7.x/personas/svg?seed=BitmojiMaleStylish_personas_45",
    "gradient": "from-purple-500 via-indigo-500 to-blue-600",
    "gender": "male",
    "category": "sunglasses"
  },
  {
    "id": "snap-m-46",
    "url": "https://api.dicebear.com/7.x/open-peeps/svg?seed=BitmojiMaleStylish_open-peeps_46",
    "gradient": "from-cyan-400 via-teal-400 to-emerald-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-47",
    "url": "https://api.dicebear.com/7.x/big-smile/svg?seed=BitmojiMaleStylish_big-smile_47",
    "gradient": "from-amber-400 via-orange-500 to-red-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-48",
    "url": "https://api.dicebear.com/7.x/micah/svg?seed=BitmojiMaleStylish_micah_48",
    "gradient": "from-rose-400 via-fuchsia-500 to-indigo-500",
    "gender": "male",
    "category": "streetwear"
  },
  {
    "id": "snap-m-49",
    "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BitmojiMaleStylish_avataaars_49",
    "gradient": "from-[#FFFC00] via-orange-400 to-pink-500",
    "gender": "male",
    "category": "male"
  },
  {
    "id": "snap-m-50",
    "url": "https://api.dicebear.com/7.x/lorelei/svg?seed=BitmojiMaleStylish_lorelei_50",
    "gradient": "from-sky-400 via-indigo-500 to-purple-600",
    "gender": "male",
    "category": "sunglasses"
  }
];

export const PRESET_AVATARS = CHARACTER_AVATARS;
