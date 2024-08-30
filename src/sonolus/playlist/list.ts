import { Text } from '@sonolus/core'
import { filterPlaylists, paginateItems } from '@sonolus/express'
import { databaseEngineItem } from 'sonolus-pjsekai-engine'
import { config } from '../../config.js'
import { sonolus } from '../index.js'
import { randomizeItems, toIndexes } from '../utils/list.js'
import { hideSpoilers } from '../utils/spoiler.js'
import { playlistSearches } from './search.js'

export const installPlaylistList = () => {
    sonolus.playlist.listHandler = ({
        search: { type, options },
        page,
        options: serverOptions,
    }) => {
        const filteredPlaylists = hideSpoilers(serverOptions.spoilers, sonolus.playlist.items)
        if (type === 'quick')
            return {
                ...paginateItems(filterPlaylists(filteredPlaylists, options.keywords), page),
                searches: playlistSearches,
            }

        if (type === 'random')
            return {
                pageCount: 1,
                items: [
                    {
                        name: `${config.sonolus.prefix}-random-${options.minRating}-${options.maxRating}`,
                        version: 1,
                        title: { en: `${options.minRating} - ${options.maxRating}` },
                        subtitle: {},
                        author: databaseEngineItem.subtitle,
                        tags: [{ title: { en: Text.Random } }],
                        levels: [],
                        meta: {
                            musicVocalTypeIndexes: new Set(),
                            characterIndexes: new Set(),
                            publishedAt: Date.now(),
                        },
                    },
                ],
                searches: playlistSearches,
            }

        const characterIndexes = toIndexes(options.artists)
        const musicVocalTypeIndexes = toIndexes(options.categories)

        const items = filterPlaylists(
            filteredPlaylists.filter(
                ({ meta }) =>
                    (!meta.characterIndexes.size ||
                        characterIndexes.some((characterIndex) =>
                            meta.characterIndexes.has(characterIndex),
                        )) &&
                    musicVocalTypeIndexes.some((musicVocalIndex) =>
                        meta.musicVocalTypeIndexes.has(musicVocalIndex),
                    ),
            ),
            options.keywords,
        ).map((playlist) => ({
            ...playlist,
            levels: hideSpoilers(
                serverOptions.spoilers,
                playlist.levels.map((levelNameOrItem) => {
                    if (typeof levelNameOrItem === 'object') return levelNameOrItem
                    const level = sonolus.level.items.find(
                        (level) => level.name === levelNameOrItem,
                    )
                    if (!level)
                        throw new Error(`Unreachable (level not found): ${String(levelNameOrItem)}`)
                    return level
                }),
            ),
        }))

        return {
            ...(options.random ? randomizeItems(items) : paginateItems(items, page)),
            searches: playlistSearches,
        }
    }
}
