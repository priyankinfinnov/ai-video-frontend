import { useState, useMemo } from 'react';
import {
  Youtube,
  Instagram,
  CheckCircle2,
  Unplug,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { SocialPlatform, SocialAccount } from '@/types/socialAccount';
import { useGetSocialAccountsQuery } from '@/queries/socialAccountQueries';
import {
  useInitiateOAuthMutation,
  useDisconnectSocialAccountMutation,
} from '@/queries/socialAccountActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';

interface PersonaIntegrationsTabProps {
  persona: Persona;
}

export const PersonaIntegrationsTab = ({ persona }: PersonaIntegrationsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<SocialPlatform | null>(null);

  const {
    data: rawSocialAccounts,
    isLoading,
  } = useGetSocialAccountsQuery({
    personaId: persona.id,
    token,
    teamId: persona.teamId,
  });

  const socialAccounts = useMemo<SocialAccount[]>(() => {
    if (Array.isArray(rawSocialAccounts)) return rawSocialAccounts;
    if (rawSocialAccounts && typeof rawSocialAccounts === 'object') {
      const obj = rawSocialAccounts as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as SocialAccount[];
      if (Array.isArray(obj.socialAccounts)) return obj.socialAccounts as SocialAccount[];
      if (Array.isArray(obj.accounts)) return obj.accounts as SocialAccount[];
    }
    return [];
  }, [rawSocialAccounts]);

  const { mutateAsync: initiateOAuth } = useInitiateOAuthMutation(token);
  const { mutateAsync: disconnectAccount } = useDisconnectSocialAccountMutation(
    persona.id,
    token,
    persona.teamId
  );

  const youtubeAccount = socialAccounts.find(
    (acc) => acc.platform === 'YOUTUBE' && acc.isConnected
  );

  const instagramAccount = socialAccounts.find(
    (acc) => acc.platform === 'INSTAGRAM' && acc.isConnected
  );

  const handleConnect = async (platform: SocialPlatform) => {
    try {
      setConnectingPlatform(platform);
      await initiateOAuth({ platform, personaId: persona.id, teamId: persona.teamId });
    } catch {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    try {
      setDisconnectingPlatform(platform);
      await disconnectAccount({ platform });
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  return (
    <div className='space-y-6 max-w-5xl' data-testid='persona-integrations-tab'>
      {/* Tab Header Banner */}
      <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-primary-600' />
            Social Media & Publishing Connections
          </h2>
          <p className='text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed'>
            Connect YouTube and Instagram accounts for <strong className='text-gray-700'>{persona.name}</strong>.
            Linked channels will be used by the automations engine to auto-upload 1440p Master Projects to YouTube Studio drafts and publish 9:16 vertical Shorts to Instagram Reels.
          </p>
        </div>

        {/* Mock Mode notice badge */}
        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 text-xs shrink-0'>
          <Info className='w-3.5 h-3.5' />
          <span>OAuth Mock Support Active</span>
        </div>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='h-64 rounded-xl bg-gray-100 animate-pulse border border-gray-200' />
          <div className='h-64 rounded-xl bg-gray-100 animate-pulse border border-gray-200' />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* YouTube Card */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-gray-300'>
            <div>
              {/* Card Header */}
              <div className='p-5 border-b border-gray-100 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100'>
                    <Youtube className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-gray-900'>YouTube Channel</h3>
                    <p className='text-xs text-gray-500'>Video drafts & YouTube Shorts</p>
                  </div>
                </div>

                {youtubeAccount ? (
                  <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
                    <CheckCircle2 className='w-3.5 h-3.5' /> Connected
                  </span>
                ) : (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                    Disconnected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className='p-5 space-y-4'>
                {youtubeAccount ? (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200/70'>
                      {youtubeAccount.profilePictureUrl || youtubeAccount.accountPicture ? (
                        <img
                          src={youtubeAccount.profilePictureUrl || youtubeAccount.accountPicture || ''}
                          alt={youtubeAccount.accountName || 'YouTube Channel'}
                          className='w-12 h-12 rounded-full object-cover border border-gray-300 shadow-2xs'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm'>
                          {(youtubeAccount.accountName || 'Y').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-semibold text-gray-900 truncate'>
                          {youtubeAccount.accountName || 'Connected YouTube Channel'}
                        </div>
                        {(youtubeAccount.username || youtubeAccount.accountName) && (
                          <div className='text-xs text-primary-600 font-mono font-medium truncate'>
                            {youtubeAccount.username
                              ? (youtubeAccount.username.startsWith('@')
                                  ? youtubeAccount.username
                                  : `@${youtubeAccount.username}`)
                              : `@${youtubeAccount.accountName}`}
                          </div>
                        )}
                        <div className='text-[11px] text-gray-500 truncate'>
                          Channel ID: <span className='font-mono'>{youtubeAccount.accountId}</span>
                        </div>
                      </div>
                    </div>

                    <div className='text-xs text-gray-500 space-y-1 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100'>
                      <div className='flex items-center gap-1.5 text-emerald-800 font-medium'>
                        <CheckCircle2 className='w-3.5 h-3.5 text-emerald-600' />
                        Ready for Automated Publishing
                      </div>
                      <p className='text-emerald-700/80 text-[11px]'>
                        Master projects can be uploaded directly as YouTube Studio drafts, and vertical clips can be published as YouTube Shorts.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <p className='text-xs text-gray-600 leading-relaxed'>
                      Link a YouTube channel for this persona. Once linked, you can set up automations to auto-publish long-form video projects to YouTube Studio and publish Shorts.
                    </p>
                    <ul className='text-xs text-gray-500 space-y-1.5 list-disc list-inside'>
                      <li>Uploads in high-definition (up to 1440p)</li>
                      <li>Private Studio Draft or Instant Public post modes</li>
                      <li>Automated title, description & tag insertion</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className='p-5 pt-0'>
              {youtubeAccount ? (
                <div className='flex items-center gap-2'>
                  <Button
                    variant='secondary-gray'
                    size='sm'
                    disabled={disconnectingPlatform === 'YOUTUBE'}
                    onClick={() => handleDisconnect('YOUTUBE')}
                    className='w-full text-xs flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  >
                    {disconnectingPlatform === 'YOUTUBE' ? (
                      <>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unplug className='w-3.5 h-3.5' />
                        Disconnect YouTube Channel
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size='sm'
                  disabled={connectingPlatform === 'YOUTUBE'}
                  onClick={() => handleConnect('YOUTUBE')}
                  className='w-full text-xs bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-xs'
                >
                  {connectingPlatform === 'YOUTUBE' ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      Connecting to YouTube...
                    </>
                  ) : (
                    <>
                      <Youtube className='w-4 h-4' />
                      Connect YouTube Channel
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Instagram Card */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-gray-300'>
            <div>
              {/* Card Header */}
              <div className='p-5 border-b border-gray-100 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100'>
                    <Instagram className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-gray-900'>Instagram Account</h3>
                    <p className='text-xs text-gray-500'>Reels automated publishing</p>
                  </div>
                </div>

                {instagramAccount ? (
                  <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
                    <CheckCircle2 className='w-3.5 h-3.5' /> Connected
                  </span>
                ) : (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                    Disconnected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className='p-5 space-y-4'>
                {instagramAccount ? (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200/70'>
                      {instagramAccount.profilePictureUrl || instagramAccount.accountPicture ? (
                        <img
                          src={instagramAccount.profilePictureUrl || instagramAccount.accountPicture || ''}
                          alt={instagramAccount.accountName || instagramAccount.username || 'Instagram Account'}
                          className='w-12 h-12 rounded-full object-cover border border-gray-300 shadow-2xs'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-sm'>
                          {(instagramAccount.username || instagramAccount.accountName || 'I').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-semibold text-gray-900 truncate'>
                          {instagramAccount.accountName || instagramAccount.username || 'Connected Instagram Account'}
                        </div>
                        {(instagramAccount.username || instagramAccount.accountName) && (
                          <div className='text-xs text-pink-600 font-mono font-medium truncate'>
                            {instagramAccount.username
                              ? (instagramAccount.username.startsWith('@')
                                  ? instagramAccount.username
                                  : `@${instagramAccount.username}`)
                              : `@${instagramAccount.accountName}`}
                          </div>
                        )}
                        <div className='text-[11px] text-gray-500 truncate'>
                          Account ID: <span className='font-mono'>{instagramAccount.accountId}</span>
                        </div>
                      </div>
                    </div>

                    <div className='text-xs text-gray-500 space-y-1 bg-pink-50/50 p-3 rounded-lg border border-pink-100'>
                      <div className='flex items-center gap-1.5 text-pink-800 font-medium'>
                        <CheckCircle2 className='w-3.5 h-3.5 text-pink-600' />
                        Connected for Reels Publishing
                      </div>
                      <p className='text-pink-700/80 text-[11px]'>
                        Vertical 9:16 short clips generated for this persona can be published directly to Instagram Reels with custom captions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <p className='text-xs text-gray-600 leading-relaxed'>
                      Connect an Instagram Professional or Creator account. Our automated scheduler can post short-form viral clips directly to your Reels feed.
                    </p>
                    <ul className='text-xs text-gray-500 space-y-1.5 list-disc list-inside'>
                      <li>Auto-post 9:16 vertical clips directly to Reels</li>
                      <li>Smart cooldown periods to protect account reach</li>
                      <li>Permalinks tracked back directly in your shorts dashboard</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className='p-5 pt-0'>
              {instagramAccount ? (
                <div className='flex items-center gap-2'>
                  <Button
                    variant='secondary-gray'
                    size='sm'
                    disabled={disconnectingPlatform === 'INSTAGRAM'}
                    onClick={() => handleDisconnect('INSTAGRAM')}
                    className='w-full text-xs flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  >
                    {disconnectingPlatform === 'INSTAGRAM' ? (
                      <>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unplug className='w-3.5 h-3.5' />
                        Disconnect Instagram Account
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size='sm'
                  disabled={connectingPlatform === 'INSTAGRAM'}
                  onClick={() => handleConnect('INSTAGRAM')}
                  className='w-full text-xs bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 shadow-xs'
                >
                  {connectingPlatform === 'INSTAGRAM' ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      Connecting to Instagram...
                    </>
                  ) : (
                    <>
                      <Instagram className='w-4 h-4' />
                      Connect Instagram Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helpful Instructions */}
      <div className='p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600 flex items-start gap-3'>
        <Info className='w-4 h-4 text-primary-600 shrink-0 mt-0.5' />
        <div className='space-y-1 leading-relaxed'>
          <span className='font-semibold text-gray-900'>How Persona Social Linking Works</span>
          <p>
            Each AI Persona can be linked to its own separate YouTube Channel and Instagram Account.
            When you create Publishing Automations, you can choose whether videos created under this persona are published as private Studio drafts for review or published directly to public feeds within a randomized posting time-window.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonaIntegrationsTab;
