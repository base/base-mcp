import { z } from 'zod';

// Schema for validating incoming requests
export const GetBuilderScoreSchema = z.object({
  builderAddress: z.string()
    .min(1, "Builder address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});


// Schema for data sources in passport profile
const dataSourcesSchema = z.object({
  profile_bio: z.string().optional(),
  profile_name: z.string().optional(),
  profile_image_url: z.string().optional(),
  profile_display_name: z.string().optional(),
}).optional();

// Schema for passport profile data
const passportProfileSchema = z.object({
  bio: z.string().optional(),
  data_sources: dataSourcesSchema,
  display_name: z.string().optional(),
  image_url: z.string().optional(),
  location: z.string().nullable(),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for passport social data
const passportSocialSchema = z.object({
  disconnected: z.boolean().optional(),
  follower_count: z.number().nullable(),
  following_count: z.number().nullable(),
  location: z.string().nullable(),
  profile_bio: z.string().optional(),
  profile_display_name: z.string().optional(),
  profile_image_url: z.string().nullable(),
  profile_name: z.string().optional(),
  profile_url: z.string().optional(),
  source: z.string().optional(),
});

// Schema for user data
const userSchema = z.object({
  admin: z.boolean().optional(),
  email: z.string().nullable(),
  id: z.string().optional(),
  name: z.string().optional(),
  profile_picture_url: z.string().optional(),
});

// Schema for the passport data returned from Talent Protocol API
export const passportSchema = z.object({
  passport: z.object({
    activity_score: z.number().optional(),
    calculating_score: z.boolean().optional(),
    created_at: z.string().optional(),
    human_checkmark: z.boolean().optional(),
    identity_score: z.number().optional(),
    last_calculated_at: z.string().optional(),
    main_wallet: z.string().optional(),
    main_wallet_changed_at: z.string().nullable(),
    merged: z.boolean().optional(),
    migrated_v2_at: z.string().optional(),
    nominations_received_count: z.number().optional(),
    onchain: z.boolean().optional(),
    passport_id: z.number().optional(),
    passport_profile: passportProfileSchema.optional(),
    passport_socials: z.array(passportSocialSchema).optional(),
    pending_kyc: z.boolean().optional(),
    score: z.number().optional(),
    skills_score: z.number().optional(),
    socials_calculated_at: z.string().optional(),
    user: userSchema.optional(),
    verified: z.boolean().optional(),
    verified_wallets: z.array(z.string()).optional(),
  }),
});

// Response schema for our API
export const responseSchema = z.object({
  message: z.string(),
  builderAddress: z.string(),
  builderData: passportSchema,
});
