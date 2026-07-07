import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SearchBox } from "../components/SearchBox"
import { SearchMarker } from "../components/SearchMarker"
import { useMapSearchIntegration } from "../hooks/useMapSearchIntegration"
import { useSearchStore } from "../store/searchStore"

const { flyTo, mapEventHandlers } = vi.hoisted(() => ({
  flyTo: vi.fn(),
  mapEventHandlers: {} as Record<string, (...args: never[]) => void>,
}))

vi.mock("react-leaflet", () => ({
  useMap: () => ({
    flyTo,
    getCenter: () => ({ lat: 0, lng: 0 }),
    getZoom: () => 2,
    getContainer: () => document.createElement("div"),
  }),
  useMapEvents: (handlers: Record<string, (...args: never[]) => void>) => {
    Object.assign(mapEventHandlers, handlers)
    return {}
  },
  Marker: (props: { position: [number, number] }) => (
    <div data-testid="search-marker" data-lat={props.position[0]} data-lng={props.position[1]} />
  ),
}))

vi.mock("../services/searchService", async () => {
  const actual = await vi.importActual<typeof import("../services/searchService")>(
    "../services/searchService"
  )
  return { ...actual, search: vi.fn() }
})

import { search } from "../services/searchService"

const RESULT = { id: "1", displayName: "Paris, France", lat: 48.85, lng: 2.35 }

function MapIntegrationHarness() {
  useMapSearchIntegration()
  return <SearchMarker />
}

function renderHarness() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchBox />
      <MapIntegrationHarness />
    </QueryClientProvider>
  )
}

describe("Search → Map integration", () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: "",
      isDropdownOpen: false,
      highlightedIndex: -1,
      selectedLocation: null,
      reverseGeocodePoint: null,
      recentSearches: [],
    })
    vi.mocked(search).mockReset()
    vi.mocked(search).mockResolvedValue([RESULT])
    flyTo.mockClear()
  })

  it("selecting a result flies the map to it at zoom 16, places a marker, and persists a recent search", async () => {
    renderHarness()
    const input = screen.getByPlaceholderText("Search places…")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "paris" } })

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))

    fireEvent.click(screen.getByRole("option"))

    await waitFor(() => expect(flyTo).toHaveBeenCalledWith([RESULT.lat, RESULT.lng], 16))

    expect(screen.getByTestId("search-marker").getAttribute("data-lat")).toBe(String(RESULT.lat))
    expect(useSearchStore.getState().recentSearches).toHaveLength(1)
    expect(useSearchStore.getState().recentSearches[0]?.result).toEqual(RESULT)
  })
})
