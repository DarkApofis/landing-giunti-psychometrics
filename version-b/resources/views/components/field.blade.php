{{--
  Form field (DESIGN-SPEC §6.6, HANDOFF §4.5; mirrors version-a/src/components/ui/FormField.tsx):
  visible label + required marker (aria-hidden) with sr-only "(obbligatorio)", optional hint linked by
  aria-describedby, 44px control, and an error message that stays hidden until the JS shows it
  (then aria-invalid="true" and aria-describedby = hint + error).
  <x-field name="email" :label="…" :hint="…" type="email" maxlength="254" autocomplete="email" />
--}}
@props(['name', 'label', 'hint' => null, 'type' => 'text', 'multiline' => false])
@php
    $id = "contact-{$name}";
    $hintId = $hint ? "{$id}-hint" : null;
@endphp
<div {{ $attributes->only('class')->class(['field']) }}>
    <label class="field__label" for="{{ $id }}">{{ $label }}<span class="field__required" aria-hidden="true">*</span><span class="sr-only"> {{ __('ui.contact.required_sr') }}</span></label>
    @if ($hint)
        <p class="field__hint" id="{{ $hintId }}">{{ $hint }}</p>
    @endif
    <div class="field__control-wrap">
        @if ($multiline)
            <textarea
                class="field__control field__control--textarea"
                id="{{ $id }}"
                name="{{ $name }}"
                aria-required="true"
                @if ($hintId) aria-describedby="{{ $hintId }}" @endif
                {{ $attributes->except('class') }}
            ></textarea>
        @else
            <input
                class="field__control"
                id="{{ $id }}"
                name="{{ $name }}"
                type="{{ $type }}"
                aria-required="true"
                @if ($hintId) aria-describedby="{{ $hintId }}" @endif
                {{ $attributes->except('class') }}
            >
        @endif
    </div>
    <p class="field__error" id="{{ $id }}-error" hidden>
        <x-icon name="circle-alert" :size="16" class="field__error-icon" />
        <span data-field-error></span>
    </p>
</div>
