import django_filters
from django import forms
from datetime import date
from .models import Entry

month_choices = [
    (1, "January"), (2, "February"), (3, "March"),
    (4, "April"), (5, "May"), (6, "June"),
    (7, "July"), (8, "August"), (9, "September"),
    (10, "October"), (11, "November"), (12, "December"),
]

class EntryFilter(django_filters.FilterSet):
    year = django_filters.ChoiceFilter(
        field_name = "created_at",
        lookup_expr = "year",
        choices = [(y, y) for y in range(2020, date.today().year + 1)],
        empty_label = "Year"
    )

    month = django_filters.ChoiceFilter(
        field_name = "created_at",
        lookup_expr = "month",
        choices = month_choices,
        empty_label = "Month"
    )

    day = django_filters.ChoiceFilter(
        field_name = "created_at",
        lookup_expr = "day",
        choices = [(d, d) for d in range(1, 32)],
        empty_label = "Day"
    )

    class Meta:
        model = Entry
        fields = ["year", "month", "day"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filter_errors = []

    @property
    def qs(self):
        data = self.data

        year = data.get("year") or None
        month = data.get("month") or None
        day = data.get("day") or None

        self.filter_errors = []

        if month and not year:
            self.filter_errors.append("Please select a year.")
        if day and not month:
            self.filter_errors.append("Please select a month.")

        if self.filter_errors:
            return self.queryset.none()

        return super().qs