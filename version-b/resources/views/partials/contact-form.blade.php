{{--
  Contact form (HANDOFF §4.5 and §6.2, DESIGN-SPEC §6.6). No backend: resources/js/modules/contact-form.js
  validates, simulates the sending (900 ms) and shows the success panel. States:
  editing → submit with errors → (re-validation on input/blur) → submitting → success → "Invia un altro".
--}}
<form class="contact-form" novalidate aria-labelledby="contact-form-title" aria-describedby="contact-form-note" data-contact-form>
    <h3 class="contact-form__title" id="contact-form-title">{{ $contact['copy']['formTitle'] }}</h3>
    <p class="contact-form__note" id="contact-form-note">{{ $contact['copy']['requiredNote'] }}</p>

    <div class="contact-form__grid">
        <x-field
            name="nome"
            :label="$contact['copy']['fields']['nome']['label']"
            :autocomplete="$contact['copy']['fields']['nome']['autoComplete']"
            :maxlength="$limits['nomeMax']"
        />
        <x-field
            name="email"
            type="email"
            :label="$contact['copy']['fields']['email']['label']"
            :hint="$contact['copy']['fields']['email']['hint']"
            :autocomplete="$contact['copy']['fields']['email']['autoComplete']"
            inputmode="email"
            spellcheck="false"
            :maxlength="$limits['emailMax']"
        />
        <x-field
            class="field--full"
            name="messaggio"
            :multiline="true"
            :label="$contact['copy']['fields']['messaggio']['label']"
            :hint="$contact['copy']['fields']['messaggio']['hint']"
            rows="5"
            :maxlength="$limits['messaggioMax']"
        />
    </div>

    {{-- Error summary: one alert on submit (not one per field), hidden again as soon as the user types. --}}
    <p class="form-alert" role="alert" hidden>
        <x-icon name="circle-alert" :size="16" class="form-alert__icon" />
        <span data-form-alert-text></span>
    </p>

    <div class="contact-form__actions">
        {{-- While sending: aria-disabled (not disabled, so focus stays), spinner and "Invio in corso…". --}}
        <button class="btn btn--primary contact-form__submit" type="submit">
            <x-icon name="send" :size="20" class="contact-form__icon-idle" />
            <x-icon name="loader-circle" :size="20" class="contact-form__icon-busy" />
            <span data-submit-label>{{ $contact['copy']['submit'] }}</span>
        </button>
        <p class="sr-only" role="status" data-form-status></p>
    </div>
</form>

<div class="form-success" role="status" hidden data-form-success>
    <x-icon name="circle-check" :size="48" stroke-width="1.75" class="form-success__icon" />
    <h3 class="form-success__title" tabindex="-1">{{ $contact['copy']['success']['title'] }}</h3>
    <p class="form-success__text" data-success-body></p>
    <button class="btn btn--secondary form-success__again" type="button" data-form-again>{{ $contact['copy']['success']['again'] }}</button>
</div>
