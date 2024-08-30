import { Icon, Text } from '@sonolus/core'
import { randomize } from '../../utils/math.js'
import { sonolus } from '../index.js'
import { hideSpoilers } from '../utils/spoiler.js'
import { playlistSearches } from './search.js'

export const installPlaylistInfo = () => {
    sonolus.playlist.infoHandler = ({ options }) => {
        const filteredPlaylists = hideSpoilers(options.spoilers, sonolus.playlist.items)
        return {
            searches: playlistSearches,
            sections: [
                {
                    title: { en: Text.Random },
                    icon: Icon.Shuffle,
                    itemType: 'playlist',
                    items: randomize(filteredPlaylists, 5),
                },
                {
                    title: { en: Text.Newest },
                    itemType: 'playlist',
                    items: filteredPlaylists.slice(0, 5),
                },
            ],
            banner: sonolus.banner,
        }
    }
}
