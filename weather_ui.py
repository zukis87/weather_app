"""Tkinter city picker and weather display."""

import queue
import threading
import tkinter as tk
from tkinter import ttk

from weather_service import WeatherError, get_weather, search_cities


def city_label(city):
    return ", ".join(str(city[key]) for key in ("name", "admin1", "country") if city.get(key))


class WeatherApp:
    def __init__(self, root):
        self.root = root
        self.cities = []
        self.messages = queue.Queue()
        self.busy = False
        root.title("City Weather")
        root.geometry("580x430")
        root.minsize(480, 400)

        frame = ttk.Frame(root, padding=24)
        frame.pack(fill="both", expand=True)
        frame.columnconfigure(0, weight=1)
        ttk.Label(frame, text="City Weather", font=("Helvetica", 22, "bold")).grid(sticky="w")
        ttk.Label(frame, text="Search for a city, choose a match, and get its current weather.", wraplength=480).grid(sticky="w", pady=(6, 18))

        self.query = tk.StringVar(value="Tel Aviv")
        self.entry = ttk.Entry(frame, textvariable=self.query)
        self.entry.grid(row=2, column=0, sticky="ew")
        self.entry.bind("<Return>", lambda event: self.search())
        self.search_button = ttk.Button(frame, text="Search", command=self.search)
        self.search_button.grid(row=2, column=1, padx=(8, 0))

        self.selector = ttk.Combobox(frame, state="disabled")
        self.selector.grid(row=3, column=0, columnspan=2, sticky="ew", pady=12)
        self.selector.bind("<<ComboboxSelected>>", lambda event: self.result.set(""))
        self.weather_button = ttk.Button(frame, text="Get weather", command=self.fetch_weather, state="disabled")
        self.weather_button.grid(row=4, column=0, sticky="w")
        self.status = tk.StringVar(value="Enter a city name to begin.")
        ttk.Label(frame, textvariable=self.status, wraplength=480).grid(row=5, column=0, columnspan=2, sticky="w", pady=12)
        self.result = tk.StringVar()
        ttk.Label(frame, textvariable=self.result, font=("Helvetica", 14), wraplength=480, justify="left").grid(row=6, column=0, columnspan=2, sticky="w")
        ttk.Label(frame, text="Weather: Open-Meteo · Locations: GeoNames").grid(row=7, column=0, columnspan=2, sticky="w", pady=(20, 0))
        self.entry.focus_set()
        root.after(100, self.poll)

    def set_busy(self, busy):
        self.busy = busy
        self.search_button.configure(state="disabled" if busy else "normal")
        self.entry.configure(state="disabled" if busy else "normal")
        self.selector.configure(state="readonly" if self.cities and not busy else "disabled")
        self.weather_button.configure(state="normal" if self.cities and not busy else "disabled")

    def run_request(self, operation, callback, message):
        self.set_busy(True)
        self.status.set(message)
        self.result.set("")

        def worker():
            try:
                self.messages.put((callback, operation(), None))
            except WeatherError as error:
                self.messages.put((callback, None, str(error)))
            except Exception:
                self.messages.put((callback, None, "An unexpected error occurred. Please try again."))

        # Network work stays off the UI thread; widgets update only in poll().
        threading.Thread(target=worker, daemon=True).start()

    def poll(self):
        try:
            callback, data, error = self.messages.get_nowait()
        except queue.Empty:
            pass
        else:
            self.set_busy(False)
            if error:
                self.status.set(error)
            else:
                callback(data)
        self.root.after(100, self.poll)

    def search(self):
        if self.busy:
            return
        name = self.query.get().strip()
        self.cities = []
        self.selector.set("")
        self.selector.configure(values=[])
        self.run_request(lambda: search_cities(name), self.show_cities, "Searching for cities…")

    def show_cities(self, cities):
        self.cities = cities
        self.selector.configure(values=[city_label(city) for city in cities])
        if cities:
            self.selector.current(0)
            self.status.set("Choose a city, then click Get weather.")
        else:
            self.status.set("No cities found. Try another name.")
        self.set_busy(False)

    def fetch_weather(self):
        index = self.selector.current()
        if self.busy or index < 0:
            return
        city = self.cities[index]

        def show_weather(weather):
            self.status.set(city_label(city))
            self.result.set(
                f"Temperature: {weather['temperature']:.1f} °C\n"
                f"Relative humidity: {weather['humidity']:g}%\n"
                f"Updated: {weather['time']} (local time)"
            )

        self.run_request(lambda: get_weather(city["latitude"], city["longitude"]), show_weather, "Loading weather…")


def launch_app():
    root = tk.Tk()
    WeatherApp(root)
    root.mainloop()
