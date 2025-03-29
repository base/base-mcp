import { isAddress } from 'viem';
import type { z } from 'zod';
import { GetBuilderScoreSchema, passportSchema } from './schemas.js';
import type { WalletClient, PublicActions } from 'viem';

export async function callBuilderScoreHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof GetBuilderScoreSchema>,
): Promise<string> {
  const { builderAddress } = args;

  if (!isAddress(builderAddress, { strict: false })) {
    throw new Error(`Invalid builder address: ${builderAddress}`);
  }

  const passport = await fetchBuilderPassport(
    builderAddress,
  );

  if (!passport.success || !passport.data) {
    throw new Error(`Failed to fetch passport: ${passport.error}`);
  }

  const analysisResult = analyzeBuilderData(passport.data);


  return JSON.stringify({
    builderAddress,
    analysis: analysisResult,
  });
}



async function fetchBuilderPassport(builderAddress: string) {
  const TALENTPROTOCOL_API_KEY = process.env.TALENTPROTOCOL_API_KEY;
  try {
    if (!TALENTPROTOCOL_API_KEY) {
      return {
        success: false,
        error: 'Talent Protocol API key not configured'
      };
    }

    const url = `https://api.talentprotocol.com/api/v2/passports/${builderAddress}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': TALENTPROTOCOL_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API error (${response.status}): ${errorText}`
      };
    }

    const data = await response.json();

    // Validate the response against our schema
    try {
      const validatedData = passportSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (validationError) {
      console.error('API response validation error:', validationError);
      return {
        success: false,
        error: 'Invalid API response format'
      };
    }

  } catch (error) {
    console.error('Error fetching builder passport:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


function analyzeBuilderData(data: any) {
  const passport = data.passport;

  // Calculate overall standing based on scores
  let overallStanding = 'Unknown';
  if (passport.score !== undefined) {
    if (passport.score >= 80) overallStanding = 'Excellent';
    else if (passport.score >= 60) overallStanding = 'Good';
    else if (passport.score >= 40) overallStanding = 'Average';
    else overallStanding = 'Developing';
  }

  // Check verification status
  const isVerified = passport.human_checkmark === true || passport.verified === true;

  // Check activity level
  let activityLevel = 'Unknown';
  if (passport.activity_score !== undefined) {
    if (passport.activity_score >= 80) activityLevel = 'Very Active';
    else if (passport.activity_score >= 50) activityLevel = 'Active';
    else activityLevel = 'Low Activity';
  }

  // Get skills/tags
  const skills = passport.passport_profile?.tags || [];

  const socialProfiles = passport.passport_socials || [];
  const connectedPlatforms = socialProfiles.map((social: any) => social.source);

  // Specifically check for GitHub presence
  const githubProfile = socialProfiles.find((social: any) => social.source === 'github');
  const hasGithub = !!githubProfile;

  // Check for basename presence
  const basenameProfile = socialProfiles.find((social: any) => social.source === 'basename');
  const hasBasename = !!basenameProfile;

  // Get total followers across platforms
  let totalFollowers = 0;
  socialProfiles.forEach((social: any) => {
    if (social.follower_count && typeof social.follower_count === 'number') {
      totalFollowers += social.follower_count;
    }
  });

  // Get display name and bio from profile or socials
  const displayName = passport.passport_profile?.display_name ||
    passport.user?.name ||
    socialProfiles[0]?.profile_display_name ||
    'Unknown';

  const bio = passport.passport_profile?.bio ||
    socialProfiles.find((social: any) => social.profile_bio)?.profile_bio ||
    '';

  return {
    builderScore: passport.score,
    name: displayName,
    bio: bio,

    overallStanding,
    isVerified,
    activityLevel,
    skills,

    socialPresence: {
      totalFollowers,
      connectedPlatforms,
      platformCount: connectedPlatforms.length
    },

    github: hasGithub ? {
      present: true,
      username: githubProfile.profile_name,
      followers: githubProfile.follower_count,
      following: githubProfile.following_count,
      profileUrl: githubProfile.profile_url
    } : {
      present: false
    },

    basename: hasBasename ? {
      present: true,
      name: basenameProfile.profile_name,
      profileUrl: basenameProfile.profile_url
    } : {
      present: false
    }
  };
}
