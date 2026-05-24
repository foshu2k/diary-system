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
        field_name = "date",
        lookup_expr = "year",
        choices = [(y, y) for y in range(2020, date.today().year + 1)],
        widget = forms.Select(attrs={"class": "filter-select"}),
        empty_label = "All Years"
    )

    month = django_filters.ChoiceFilter(
        field_name = "date",
        lookup_expr = "month",
        choices = month_choices,
        widget = forms.Select(attrs={"class": "filter-select"}),
        empty_label = "All Months"
    )

    day = django_filters.ChoiceFilter(
        field_name = "date",
        lookup_expr = "day",
        choices = [(d, d) for d in range(1, 32)],
        widget = forms.Select(attrs={"class": "filter-select"}),
        empty_label = "All Days"
    )

    class Meta:
        model = Entry
        fields = ['year', 'month', 'day']